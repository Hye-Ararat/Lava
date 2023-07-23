import express from "express";
import expressWs from "express-ws";
import ws from "ws"
import jslxd from "js-lxd"
const app = express();
expressWs(app) 

function openWebsocket(path: string, access_token: string, url: string) {
    var u = new URL(url);
    return new ws.WebSocket("wss://" + u.host + "/1.0" + path, {
        "headers": {
            "X-LXD-oidc": "true",
            Authorization: `Bearer ${access_token}`
        },
        rejectUnauthorized: false
    });
}

//@ts-expect-error
app.ws("/events", (wss: ws.WebSocket, req: express.Request) => {

    try {
        var ws = openWebsocket("/events", (req.query.access_token as string), `https://127.0.0.1:8443`)
        ws.on("message", (data) => {
            wss.send(data.toString())
        })
        wss.on("close", () => ws.close())
        ws.on("close", () => wss.close())
    } catch (error) {
        wss.terminate();
    }

})

app.listen(3001, () => {
    console.log("Hye Lava is listening on port 3001");
})
