import { exists, existsSync, mkdirSync, rmdirSync, writeFileSync } from "fs";
import { LXDclient as client } from "./incus.js";

export function listen(sockets) {
    console.log("Event Handler Running")
    let list = client.events();
    list.on("message", async (msg) => {
        if (JSON.parse(msg).metadata.message == "Start finished") {
            const inst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
            if (inst.metadata.status == "Running") {
                let socks;
                if (inst.metadata.config["image.variant"]) {
                    if (inst.metadata.config["image.variant"] == "stateless") {
                        console.log("STATELESS N_VPS")
                        if (inst.metadata.config["user.stateless-startup"]) {
                            let user;
                            let wd;
                            if (inst.metadata.config["user.stateless-user"]) user = parseInt(inst.metadata.config["user.stateless-user"]);
                            if (inst.metadata.config["user.stateless-directory"]) wd = inst.metadata.config["user.stateless-directory"];
                            let environment = {}
                            Object.keys(inst.metadata.config).forEach((key) => {
                                if (key.startsWith("environment.")) {
                                    environment[key.replace("environment.", "")] = inst.metadata.config[key];
                                }
                            })
                            let startup = inst.metadata.config["user.stateless-startup"].split(" ");
                            startup = startup.map((arg) => {
                                if (arg.startsWith("$")) {
                                    return environment[arg.replace("$", "")];
                                } else {
                                    return arg;
                                }
                            })
                            console.log(startup, user, wd)
                            try {
                                //sleep function
                                function sleep(ms) {
                                    return new Promise((resolve) => {
                                        setTimeout(resolve, ms);
                                    });
                                }
                                await sleep(3000);
                                socks = await client.instance(JSON.parse(msg).metadata.context.instance).exec(startup, user, wd)
                                if (existsSync("./logs/" + inst.metadata.name)) {
                                    rmdirSync("./logs/" + inst.metadata.name, {
                                        recursive: true
                                    });
                                }
                            } catch (error) {
                                console.log(error);
                            }
                            socks["stdout"].addEventListener("message", async (dat) => {

                                if (!existsSync("./logs")) {
                                    mkdirSync("./logs");
                                }

                                if (!existsSync("./logs/" + inst.metadata.name)) {
                                    mkdirSync("./logs/" + inst.metadata.name);
                                }

                                if (!existsSync("./logs/" + inst.metadata.name + "/logs")) {
                                    writeFileSync("./logs/" + inst.metadata.name + "/logs", "");
                                }
                                writeFileSync("./logs/" + inst.metadata.name + "/logs", dat.data.toString(), {
                                    flag: "a"
                                });
                                //console.log(dat.data.toString())
                                if (dat.data == "") {
                                    let updInst = await client.instance(JSON.parse(msg).metadata.context.instance).data;
                                    if (updInst.metadata.status == "Running") {
                                        await client.instance(JSON.parse(msg).metadata.context.instance).updateState("stop");
                                        socks["stdin"].close();
                                    }
                                    if (existsSync("./logs/" + inst.metadata.name + "/logs")) {
                                        writeFileSync("./logs/" + inst.metadata.name + "/logs", "Instance Stopped\n", {
                                            flag: "a"
                                        });
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
                //log operation secret
                /**
                 * @type {WebSocket}
                 */
                let out = socks['stdout']
                console.log(out.url)
                console.log(socks["stdin"])

                let secretOut = out.url.split("secret=")[1]
                let secretIn = socks["stdin"].url.split("secret=")[1]
                console.log(secretOut)
                console.log(secretIn)
                if (inst.metadata.config["image.variant"] == "stateless") {
                    console.log("YES STATELESS")
                    sockets[`${inst.metadata.name}-console`] = {
                        connections: 0,
                        socket: socks["stdout"],
                        stateless: true
                    }
                    sockets[`${inst.metadata.name}-console-control`] = {
                        connections: 0,
                        socket: socks["stdin"],
                        stateless: true
                    }
                } else {
                    sockets[secretOut] = {
                        connections: 0,
                        socket: socks["stdout"],
                        stateless: true
                    }
                    sockets[secretIn] = {
                        connections: 0,
                        socket: socks["stdin"],
                        stateless: true
                    }
                }
                /*global.sockets.push({
                    name: JSON.parse(msg).metadata.context.instance,
                    socket: socks
                })*/;
            }
        }

    })
}