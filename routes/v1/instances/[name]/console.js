import express from "express";
import WebSocket from "ws";
import path from "path";
import { readdirSync } from "fs";
import { homedir } from "os";


const router = express.Router({ mergeParams: true });

router.ws("/", async (ws, req) => {
    const { name } = req.params;
    const webs = new WebSocket(`ws+unix://${homedir()}/.lava/console.sock:/${name}`);
    function start() {
        webs.on("message", (e) => {
            ws.send(e, { binary: true });
        })
        ws.on("message", (e) => {
            webs.send(e, { binary: true });
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