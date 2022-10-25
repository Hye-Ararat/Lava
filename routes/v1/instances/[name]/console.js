import express from "express";
import WebSocket from "ws";
import path from "path";
import { readdirSync } from "fs";
import { homedir } from "os";
import axios from "axios";


const router = express.Router({ mergeParams: true });

router.ws("/", async (ws, req) => {
    const { name } = req.params;
    let authorization = req.headers.authorization;
    let permissions = await axios.get(process.env.PANEL_URL + "/api/v1/instances/" + name + "/permissions", {
        headers: {
            Authorization: authorization
        }
    })
    permissions = permissions.data;
    if (!permissions.includes("view-console_instance")) {
        ws.send("You don't have permission to view the console\x85", { binary: true });
        return ws.close();
    }
    const webs = new WebSocket(`ws+unix://${homedir()}/.lava/console.sock:/${name}`);
    function start() {
        webs.on("message", (e) => {
            ws.send(e, { binary: true });
        })
        ws.on("message", (e) => {
            if (permissions.includes("control-console_instance")) {
                webs.send(e, { binary: true });
            } else {
                ws.send("You don't have permission to control the console\x85", { binary: true });
            }
        })
    }
    if (!webs.OPEN) {
        webs.addEventListener("open", () => {
            start();
        })
    } else {
        start();
    }
    ws.on("close", () => {
        webs.close();
    })
})

export default router;