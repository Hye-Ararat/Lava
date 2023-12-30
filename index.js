import express from "express";
import expressWs from "express-ws";
import ws from "ws"
import { listen as eventHandler } from "./eventHandler.js";
import { LXDclient } from "./incus.js";
const app = express();
expressWs(app)
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



    app.ws("/operations/:operation/websocket", (ws, req) => {
        console.log(sockets)
        console.log(sockets[req.query.secret])
        if (!(sockets[req.query.secret])) {
            try {
                console.log("NEW SOCKET")
                let socket =  LXDclient.request.websocket(`/1.0/operations/${req.params.operation}/websocket?secret=${req.query.secret}`)
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
                    sockets[req.query.secret].socket.close();
                    delete sockets[req.query.secret];
                } else {
                    sockets[req.query.secret].connections -= 1;
                }
            } catch (error) {
                
            }
        
        })
    })




app.listen(3003, () => {
    console.log("Hye Lava is listening on port 3003");
})
