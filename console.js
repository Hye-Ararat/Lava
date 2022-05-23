import express from "express";
import cors from "cors";
import { existsSync, rmSync } from "fs";
import { LXDclient as client } from "./lib/lxd.js";
import { add, get, remove } from "./lib/console.js";
import { homedir } from "os";

export default async () => {
    const app = express();
    (await import("express-ws")).default(app);
    app.use(cors());
    app.ws("/:name", async (ws, req) => {
        const name = req.params.name;
        let logs;
        const inst = await client.instance(name).data;
        try {
            logs = await client.instance(name).consoleLog();
            ws.send(logs);
        } catch (error) {

        }
        if (get(name) && inst.metadata.status != "Running") {
            remove(name);
        }
        if (!get(name)) {
            let socks;
            if (inst.metadata.status == "Running") {
                try {
                    socks = await client.instance(name).console("console");
                } catch (error) {
                    console.log(error);
                }
                add(name, socks.stdin, socks.stdout);
                ready();
            } else {
                ws.send("Instance offline");
                const interval = setInterval(() => {
                    if (get(name)) {
                        ready();
                        clearInterval(interval);
                    }
                }, 100);
                ws.on("close", () => {
                    clearInterval(interval);
                })
            }
        } else {
            ready();
        }
        function startStdout() {
            get(name).socket.stdout.on("message", (event) => {
                if (event == "") {
                    get(name).socket.stdout.close();
                    return;
                }
                ws.send(event, { binary: true });
            });
            get(name).socket.stdout.on("close", () => {
                ws.onmessage = () => { };
                remove(name);
                ws.send("Instance offline");
                const interval = setInterval(() => {
                    if (get(name)) {
                        ready();
                        clearInterval(interval);
                    }
                }, 100)
                ws.on("close", () => {
                    clearInterval(interval);
                })
            })
        }
        function startStdin() {
            ws.onmessage = (e) => {
                get(name).socket.stdout.send(e.data, { binary: true });
            }
        }
        function ready() {
            if (get(name)) {
                if (get(name).socket) {
                    if (get(name).socket.stdout) {
                        if (!get(name).socket.stdout.OPEN) {
                            get(name).socket.stdout.on("open", () => {
                                startStdout();
                            })
                            get(name).socket.stdin.on("open", () => {
                                startStdin();
                            })
                        } else {
                            startStdout();
                            startStdin();
                        }
                    }
                }
            }
        }

    })
    if (existsSync(homedir() + "/.lava/console.sock")) {
        rmSync(homedir() + "/.lava/console.sock");
    }
    app.listen(homedir() + "/.lava/console.sock", () => {
        console.log("Console server running ✅");
    });
}
