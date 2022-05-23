import express from "express";
import { getState } from "../../../../lib/lxd.js";
import { create, all } from "mathjs";

const router = express.Router({ mergeParams: true });
const math = create(all)
math.config({
    number: "BigNumber",
    precision: 64
})

router.ws("/", async (ws, req) => {
    const { name } = req.params;
    function stateWithCpu(fast) {
        return new Promise(async (resolve, reject) => {
            const state = await getState(name);
            let startTime = Date.now();
            let cpu1 = math.divide(state.cpu.usage, 1e+9);
            await new Promise(r => setTimeout(r, fast ? 50 : 900));
            const state2 = await getState(name);
            let endTime = Date.now();
            let cpu2 = math.divide(state2.cpu.usage, 1e+9);
            let cpuUsage = math.multiply(math.divide(math.subtract(cpu2, cpu1), math.subtract(endTime, startTime)), 100000);
            resolve({
                ...state2,
                cpu: {
                    usage: cpuUsage > 100 ? 100 : cpuUsage < 0 ? 0 : cpuUsage
                }
            })
        })
    }

    ws.send(JSON.stringify(await stateWithCpu(true)));

    const interval = setInterval(async () => {
        ws.send(JSON.stringify(await stateWithCpu()));


    }, 1000);

    ws.on("close", () => {
        clearInterval(interval);
    })

});

export default router;