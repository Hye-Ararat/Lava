const express = require("express");
const app = express();
require("express-ws")(app);

app.ws("/install", (ws: any, req: any) => {
        console.log("✅ Connection Established")
        console.log("⬇️ Installing LXD...")
        ws.send(JSON.stringify(
            {
                status: "Installing LXD...",
                percent: 1,
                image: "https://linuxcontainers.org/lxd/docs/latest/_images/containers.png",
            }
        ));
        setTimeout(() => {
            ws.send(JSON.stringify(
                {
                    status: "Installing LXD...",
                    percent: 2,
                    image: "https://linuxcontainers.org/lxd/docs/latest/_images/containers.png",
                }
            ));
        }, 1500)

})

app.listen(3001, () => {
    console.log("✅ Hye Lava is ready to be installed. Please press next in Hye Ararat.")
})