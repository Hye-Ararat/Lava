import { LXDclient as client } from "./lxd.js";


export function listen() {
    global.sockets = [];
    let list = client.events();
    list.on("message", async (msg) => {
        if (JSON.parse(msg).metadata.message == "Start finished") {
            const inst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
            if (inst.metadata.status == "Running") {
                let socks;
                try {
                    socks = await client.instance(JSON.parse(msg).metadata.context.instance).console("console");
                } catch (error) {
                    console.log(error)
                }
                global.sockets.push({
                    name: JSON.parse(msg).metadata.context.instance,
                    socket: socks
                });
            }
        }

    })
}