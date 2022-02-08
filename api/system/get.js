const { client, lxd } = require('../..');
const Axios = require('axios').default
const s = require('systeminformation')
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function getSystem(req, res) {
    try {
        var cpu = await s.cpu()
        var currentspeed = await s.cpuCurrentSpeed()
        var mem = await s.mem()
        console.log(cpu)
        res.json({
            cpu: {
                cores: cpu.cores,
                speed: cpu.speed + "Ghz",
                family: cpu.brand,
                manufacturer: cpu.manufacturer,
                currentspeed: currentspeed.avg
            },
            memory: {
                total: mem.total,
                used: mem.used,
                free: mem.free,
            },
            version: process.env.VERSION,
            mem_usage: process.memoryUsage().heapUsed
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }

}
module.exports = getSystem