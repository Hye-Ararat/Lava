var { client, ararat } = require('../../index')
const { convertID } = require('../../lib/converter')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    try {
        if (!req.body.id) return res.json({ status: "Error", data: {}, reason: "id field not specified" })
        var { id } = req.body
        try {
            var check = await client.instance(convertID(id))
        } catch {
            var check = null
        }
        if (check == null) {
            var magma_cube = await (await ararat.instance(id, ["magma_cube", "network"])).relationships.magma_cube
            console.log(magma_cube)
            var internalID = convertID(id)
            var instanceConfig = {
                "devices": req.body.devices,
                "config": {
                    "environment": req.body.environment,
                    "limits.cpu": req.body.limits.cpu.limit.toString(),
                    "limits.memory": req.body.limits.memory.limit.toString(),
                },
                "type": req.body.type
            }
            if (req.body.type == "container") {
                instanceConfig.config["limits.memory.enforce"] = req.body.limits.memory.enforce ? "hard" : "soft"
                instanceConfig.config["limits.cpu.priority"] = req.body.limits.cpu.priority.toString()
            }
            if (req.body.limits.disk.priority != null) {
                instanceConfig.config["limits.disk.priority"] = req.body.limits.disk.priority.toString()
            }
            var inst = await client.create(internalID, {
                "source": {
                    "type": "image",
                    "mode": "pull",
                    "server": magma_cube.image_server.address,
                    "protocol": magma_cube.image_server.protocol,
                    "alias": process.arch.includes("arm") ? magma_cube.images[req.body.image].arm64 : magma_cube.images[req.body.image].amd64,
                },
                ...instanceConfig
            })
            inst.on('progress', p => {
                console.log(p)
            })
            inst.on('error', (err) => {
                console.log(err)
            })
            inst.on('finished', () => {
                console.log('ok')
            })
            //var instance = await client.create(internalID, )
        } else {
            res.json({ status: "Error", data: {}, reason: "Instance already exists" })
        }
    } catch (error) {
        if (error.request) {
            res.json({ status: "Error", data: {}, reason: error.request.data })
        } else {
            if (process.env.DEBUG) {
                console.log(error)
                res.json({ status: "Error", data: {}, reason: error.message })
            } else {
                res.json({ status: "Error", data: {}, reason: "" })
            }
        }

    }

}