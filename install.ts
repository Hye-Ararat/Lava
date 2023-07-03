import { execSync } from "child_process";
import { connectUnix } from "js-lxd";

const express = require("express");
const app = express();
require("express-ws")(app);

app.ws("/install", async (ws: any, req: any) => {
    let url;
    ws.on("message", (msg: any) => {
        url = msg;
    })
    console.log("✅ Connection Established")
    console.log("⬇️ Installing LXD...")
    ws.send(JSON.stringify(
        {
            status: "Installing LXD...",
            percent: 33,
            image: "https://linuxcontainers.org/lxd/docs/latest/_images/containers.png",
        }
    ));
    execSync("snap install lxd --channel=latest/stable", { stdio: "inherit" })
    ws.send(JSON.stringify(
        {
            status: "Configuring LXD...",
            percent: 67,
            image: "https://linuxcontainers.org/lxd/docs/latest/_images/containers.png",
        }
    ));
    console.log("⚙️ Configuring LXD...")
    let lxdClient = connectUnix("/var/snap/lxd/common/lxd/unix.socket");
    let e = await lxdClient.patch("", {
        "config": {
            "core.https_address": "[::]:8443",
            "oidc.client.id": "lxd",
            "oidc.issuer": `${url}/oidc`
        }
    });
    ws.send(JSON.stringify(
        {
            status: "Setup Complete!",
            percent: 100,
            image: "https://linuxcontainers.org/lxd/docs/latest/_images/containers.png",
        }
    ));
    console.log("Setup Complete!")

})

app.listen(3001, () => {
    console.log("✅ Hye Lava is ready to be installed. Please press next in Hye Ararat.")
})