import { LXDclient as client } from "./lxd.js";


export function listen() {
    console.log("Event Handler Running")
    global.sockets = [];
    let list = client.events();
    list.on("message", async (msg) => {
        if (JSON.parse(msg).metadata.message == "Start finished") {
            const inst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
            if (inst.metadata.status == "Running") {
                let socks;
                if (inst.metadata.config["image.variant"]) {
                    if (inst.metadata.config["image.variant"] == "stateless") {
                        console.log("STATELESS N_VPS")
                        if (inst.metadata.config["user.startup"]) {
                            let user;
                            let wd;
                            if (inst.metadata.config["user.user"]) user = parseInt(inst.metadata.config["user.user"]);
                            if (inst.metadata.config["user.working_dir"]) wd = inst.metadata.config["user.working_dir"];
                            let environment = {}
                            Object.keys(inst.metadata.config).forEach((key) => {
                                if (key.startsWith("environment.")) {
                                    environment[key.replace("environment.", "")] = inst.metadata.config[key];
                                }
                            })
                            let startup = inst.metadata.config["user.startup"].split(" ");
                            startup = startup.map((arg) => {
                                if (arg.startsWith("$")) {
                                    return environment[arg.replace("$", "")];
                                } else {
                                    return arg;
                                }
                            })
                            try {
                                socks = await client.instance(JSON.parse(msg).metadata.context.instance).exec(startup, user, wd)
                            } catch (error) {
                                console.log(error);
                            }
                            socks["stdout"].addEventListener("message", async (dat) => {
                                if (dat.data == "") {
                                    let updInst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
                                    if (updInst.metadata.status == "Running") {
                                        await client.instance(JSON.parse(msg).metadata.context.instance).updateState("stop");
                                        socks["stdin"].close();
                                    }
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
                console.log("PUSHING")
                global.sockets.push({
                    name: JSON.parse(msg).metadata.context.instance,
                    socket: socks
                });
            }
        }

    })
}