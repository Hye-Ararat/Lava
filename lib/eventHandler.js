import { LXDclient as client } from "./lxd.js";


export function listen() {
    global.sockets = [];
    let list = client.events();
    list.on("message", async (msg) => {
        if (JSON.parse(msg).metadata.message == "Start finished") {
            const inst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
            if (inst.metadata.status == "Running") {
                let socks;
                if (inst.metadata.config["image.variant"]) {
                    if (inst.metadata.config["image.variant"] == "stateless") {
                        if (inst.metadata["user.startup"]) {
                            let user;
                            let wd;
                            if (inst.metadata["user.user"]) user = parseInt(inst.metadata["user.user"]);
                            if (inst.metadata["image.user"]) user = parseInt(inst.metadata["image.user"]);
                            if (inst.metadata["user.working_dir"]) wd = inst.metadata["user.working_dir"];
                            if (inst.metadata["image.working_dir"]) wd = inst.metadata["image.working_dir"];
                            try {
                                socks = await client.instance(JSON.parse(msg).metadata.context.instance).exec(inst.metadata["user.startup"].split(" "), user, wd)
                            } catch (error) {
                                console.log(error);
                            }
                            socks[0].on("close", () => {
                                let updInst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
                                if (updInst.metadata.status == "Running") {
                                    await client.instance(JSON.parse(msg).metadata.context.instance).updateState("stop");
                                    socks[1].close();
                                }
                            })

                        }
                    }
                }
                if (!socks) {
                    try {
                        socks = await client.instance(JSON.parse(msg).metadata.context.instance).console("console");
                    } catch (error) {
                        console.log(error)
                    }
                }
                global.sockets.push({
                    name: JSON.parse(msg).metadata.context.instance,
                    socket: socks
                });
            }
        }

    })
}