import express from "express";
import expressWs from "express-ws";
import ws from "ws"
import { listen as eventHandler } from "./eventHandler.js";
import { LXDclient } from "./incus.js";
import { exec, execSync, spawn } from "child_process";
import cors from "cors";
import { access, readFileSync } from "fs";
import axios from "axios";
import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk"
const app = express();
expressWs(app)
app.use(cors())


function openWebsocket(path, access_token, url) {
    var u = new URL(url);
    return new ws.WebSocket("wss://" + u.host + "/1.0" + path, {
        "headers": {
            "X-Incus-oidc": "true",
            Authorization: `Bearer ${access_token}`
        },
        rejectUnauthorized: false
    });
}

//@ts-expect-error
let sftpSockets = {};
app.ws("/instances/:instance/files/unzip", async (ws, req) => {
    let lxdConfig = await LXDclient.request.get("/1.0");
    let araratUrl = lxdConfig.data.metadata.config["oidc.issuer"].split("/oidc")[0];
    let fgaKey = lxdConfig.data.metadata.config["openfga.api.token"];
    let fgaStoreId = lxdConfig.data.metadata.config["openfga.store.id"];
    let fgaStoreModel = lxdConfig.data.metadata.config["openfga.store.model_id"];
    let valid;
    try {
        valid = await axios.get(`${araratUrl}/api/authentication/verify`, {
            headers: {
                "access_token": accessToken
            }
        })
    } catch (error) {
        console.log(error.response.data)
        return;
    }
    const fgaClient = new OpenFgaClient({
        apiScheme: "http",
        apiHost: "127.0.0.1:8080",
        authorizationModelId: fgaStoreModel,
        storeId: fgaStoreId,
        credentials: {
            method: CredentialsMethod.ApiToken,
            config: {
                token: fgaKey
            }
        }
    })
    let user = await fgaClient.check({
        user: `user:${valid.data.id}`,
        relation: "user",
        object: `instance:default/${req.params.instance}`,
    })
    if (user.allowed == false) {
        return ws.close();
    }
    let path = req.query.path;
    let instance = req.params.instance;
    console.log(`unzip ${path}`)
    const instanceData = (await LXDclient.instance(instance).data).metadata;
    let instanceUser = undefined;
    if (instanceData.expanded_config["user.stateless-user"]) {
        instanceUser = instanceData.expanded_config["user.stateless-user"]
    }
    const unzip = await LXDclient.instance(instance).exec(`unzip ${path}`.split(" "), parseInt(instanceUser), path.split("/").slice(0, -1).join("/"));
    unzip["stdout"].addEventListener("message", (data) => {
        console.log(data.data.toString());
        ws.send(data.data.toString())
    });
    unzip["stdin"].addEventListener("message", (data) => {
        console.log(data.data.toString());
        ws.send(data.data.toString())
    })
})
app.get("/instances/:instance/sftp", async (req, res) => {
    let lxdConfig = await LXDclient.request.get("/1.0");
    let araratUrl = lxdConfig.data.metadata.config["oidc.issuer"].split("/oidc")[0];
    let fgaKey = lxdConfig.data.metadata.config["openfga.api.token"];
    let fgaStoreId = lxdConfig.data.metadata.config["openfga.store.id"];
    let fgaStoreModel = lxdConfig.data.metadata.config["openfga.store.model_id"];
    let valid;
    try {
        valid = await axios.get(`${araratUrl}/api/authentication/verify`, {
            headers: {
                "access_token": accessToken
            }
        })
    } catch (error) {
        console.log(error.response.data)
        return;
    }
    const fgaClient = new OpenFgaClient({
        apiScheme: "http",
        apiHost: "127.0.0.1:8080",
        authorizationModelId: fgaStoreModel,
        storeId: fgaStoreId,
        credentials: {
            method: CredentialsMethod.ApiToken,
            config: {
                token: fgaKey
            }
        }
    })
    let user = await fgaClient.check({
        user: `user:${valid.data.id}`,
        relation: "user",
        object: `instance:default/${req.params.instance}`,
    })
    if (user.allowed == false) {
        return res.status(403).json({
            error: "You are not allowed to access this instance"
        })
    }
    let sftp = spawn("incus", `file mount ${req.params.instance} --listen 0.0.0.0:0`.split(" "))
    let connString = null;
    let login = null;
    let password = null;
    let sent = false;
    if (sftpSockets[req.params.instance]) {
        if (!sent) {
            res.json(sftpSockets[req.params.instance])
            sent = true;
        }
        return;
    }
    sftp.stdout.on("data", (data) => {
        if (data.toString().includes("SSH SFTP listening on ")) {
            connString = data.toString().split("SSH SFTP listening on ")[1].replace("\n", "").split("Login")[0];
        }
        if (data.toString().includes("Login with")) {
            login = data.toString().split(`"`)[1];
            password = data.toString().split(`"`)[3];

        }
        if (connString && login && password) {
            sftpSockets[req.params.instance] = {
                connString: connString,
                login: login,
                password: password
            }
            if (!sent) {
                res.json({
                    connString: connString,
                    login: login,
                    password: password
                })
                sent = true;

            }
        }
    })
    sftp.stderr.on("data", (data) => {
        console.log(data.toString())
    })
    sftp.on("close", (code) => {
        console.log(code)
    })

})
app.ws("/events", (wss, req) => {

    try {
        var webs = openWebsocket("/events", (req.query.access_token), `https://127.0.0.1:8443`)
        webs.on("message", (data) => {
            wss.send(data.toString())
        })
        wss.on("close", () => webs.close())
        webs.on("close", () => wss.close())
    } catch (error) {
        wss.terminate();
    }

})
let sockets = {};

eventHandler(sockets);

app.ws("/instance/:instance/console", async (ws, req) => {
    let accessToken = req.query.access_token;
    let lxdConfig = await LXDclient.request.get("/1.0");
    let araratUrl = lxdConfig.data.metadata.config["oidc.issuer"].split("/oidc")[0];
    let fgaKey = lxdConfig.data.metadata.config["openfga.api.token"];
    let fgaStoreId = lxdConfig.data.metadata.config["openfga.store.id"];
    let fgaStoreModel = lxdConfig.data.metadata.config["openfga.store.model_id"];
    let valid;
    try {
        valid = await axios.get(`${araratUrl}/api/authentication/verify`, {
            headers: {
                "access_token": accessToken
            }
        })
    } catch (error) {
        console.log(error.response.data)
        return;
    }
    const fgaClient = new OpenFgaClient({
        apiScheme: "http",
        apiHost: "127.0.0.1:8080",
        authorizationModelId: fgaStoreModel,
        storeId: fgaStoreId,
        credentials: {
            method: CredentialsMethod.ApiToken,
            config: {
                token: fgaKey
            }
        }
    })
    let user = await fgaClient.check({
        user: `user:${valid.data.id}`,
        relation: "user",
        object: `instance:default/${req.params.instance}`,
    })
    if (user.allowed == false) {
        return ws.close();
    }
    console.log(user)
    console.log(valid.data)
    //console.log(sockets, "THE SOCKETS")
    //console.log(sockets[`${req.params.instance}-console`])
    //console.log("This is the socket ^")
    try {
        try {
            sockets[`${req.params.instance}-console`].connections += 1;
            sockets[`${req.params.instance}-console-control`].connections += 1;


        } catch (error) {

        }
        let logs = readFileSync(`./logs/${req.params.instance}/logs`).toString();
        //send logs as binary
        ws.send(logs, { binary: true });
        sockets[`${req.params.instance}-console`].socket.addEventListener("message", (data) => {
            ws.send(data.data, { binary: true });
        })
        sockets[`${req.params.instance}-console-control`].socket.addEventListener("message", (data) => {
            ws.send(data.data, { binary: true });
        })
        ws.on("message", (data) => {
            sockets[`${req.params.instance}-console`].socket.send(data, { binary: true });
        })
        ws.on("close", () => {
            try {
                let number = sockets[`${req.params.instance}-console`].connections;

                sockets[`${req.params.instance}-console`].connections -= 1;
                sockets[`${req.params.instance}-console-control`].connections -= 1;


            } catch (error) {

            }

        })
    } catch (error) {

    }

})

app.ws("/operations/:operation/websocket", (ws, req) => {
    console.log(sockets)
    console.log(sockets[req.query.secret])
    try {
        if (!(sockets[req.query.secret])) {
            try {
                console.log("NEW SOCKET")
                let socket = LXDclient.request.websocket(`/1.0/operations/${req.params.operation}/websocket?secret=${req.query.secret}`)
                console.log('got past')
                socket.onclose = () => {
                    delete sockets[req.query.secret];
                }
                sockets[req.query.secret] = {
                    connections: 0,
                    socket: socket
                }
            } catch (error) {

            }

        }
        try {
            sockets[req.query.secret].connections += 1;

        } catch (error) {

        }
        sockets[req.query.secret].socket.addEventListener("message", (data) => {
            ws.send(data.data, { binary: true });
        })
        ws.on("message", (data) => {
            sockets[req.query.secret].socket.send(data, { binary: true });
        })
        ws.on("close", () => {
            try {
                let number = sockets[req.query.secret].connections;
                if (number == 1) {
                    if (!sockets[req.query.secret].stateless) {
                        sockets[req.query.secret].socket.close();
                        delete sockets[req.query.secret];
                    }
                } else {
                    sockets[req.query.secret].connections -= 1;
                }
            } catch (error) {

            }

        })
    } catch (error) {

    }

})




app.listen(3003, () => {
    console.log("Hye Lava is listening on port 3003");
})
