// here
const { client, ararat, ws, db } = require('../../../index')
const { convertID } = require('../../../lib/converter')
const { Worker } = require("worker_threads")
const consoleMessage = require('../../../lib/consoleMessage')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
async function setState(req, res) {
    var inst = await client.instance(convertID(req.params.instance))
    if (db.collection('instances').exist(req.params.instance) == false) {
        db.collection('instances').create(req.params.instance)
    }
    console.log(req.body)
    switch (req.body.state) {
        case "start":
            try {
                if (inst != null) {
                    var araratInstance = await ararat.instance(req.params.instance, ["magma_cube"])
                    if (inst.type() == "container" && araratInstance.relationships.magma_cube.stateless == true) {
                        // temporary no multi-\\\\\\\
                        //araratInstance.relationships.magma_cube.images[araratInstance.magma_cube.image_group][araratInstance.magma_cube.image_index].states.running
                        db.collection('instances').add(req.params.instance, {
                            state: "Starting"
                        })
                        if (await inst.state() == "Stopped") {
                            await inst.start()
                        }

                        //wolfo, if your reading this please make multi-socket work. Tomorrow I will investigate making the user and cwd dynamic and stuff. I literally spent all day trying to make this work 🤣. All the best - Ender.
                        if (araratInstance.relationships.magma_cube.stateless == true) {
                            if (araratInstance.relationships.magma_cube.user) {
                                var config = { endpoint: "exec", "command": araratInstance.relationships.magma_cube.entrypoint.split(" "), user: araratInstance.relationships.magma_cube.user }
                                if (araratInstance.relationships.magma_cube.mount) {
                                    config.cwd = araratInstance.relationships.magma_cube.mount
                                }
                            }
                        } else if (araratInstance.type == "n-vps" || araratInstance.relationships.magma_cube.console == "xterm") {
                            var config = { endpoint: "console" }
                        } else if (araratInstance.type == "kvm") {
                            //setup spice code
                        }
                        console.log(araratInstance.relationships.magma_cube)
                        console.log(config)
                        if (araratInstance.relationships.magma_cube.stateless == true) {
                            var cons = await inst.console("console", { endpoint: "exec", raw: config })
                            console.log(araratInstance.relationships.magma_cube.states.running)
                            var index = ws.add(req.params.instance, cons) - 1
                            console.log(index)
                            console.log(ws.websockets)
                            console.info('ok boomer') // we need this tho shut i nee
                            res.send("Success")
                            var arr = ws.websockets
                            cons.operation.onmessage = async ({ data }) => {
                                if (data == "") {
                                    var arr = ws.websockets;
                                    var item = ws.get(req.params.instance)
                                    arr.splice(arr.indexOf(item), 1)
                                    ws.set(arr)
                                    try {
                                        await inst.stop();
                                    } catch {
                                        try {
                                            await inst.stop(true);
                                        } catch {

                                        }
                                    }
                                    db.collection('instances').add(req.params.instance, {
                                        state: "Offline"
                                    })
                                } else {

                                    araratInstance.relationships.magma_cube.states.running.forEach(sta => {
                                        if (data.toString().includes(sta)) {

                                            db.collection('instances').add(req.params.instance, {
                                                state: "Online"
                                            })
                                        }
                                    })

                                }
                            }
                            ws.get(req.params.instance).ws.operation.onmessage = async ({ data }) => {
                                if (data == "") {
                                    var arr = ws.websockets;
                                    var item = ws.get(req.params.instance)
                                    arr.splice(arr.indexOf(item), 1)
                                    ws.set(arr)
                                    try {
                                        await inst.stop();
                                    } catch {
                                        try {
                                            await inst.stop(true);
                                        } catch {

                                        }
                                    }
                                    db.collection('instances').add(req.params.instance, {
                                        state: "Offline"
                                    })
                                } else {

                                    araratInstance.relationships.magma_cube.states.running.forEach(sta => {
                                        if (data.toString().includes(sta)) {

                                            db.collection('instances').add(req.params.instance, {
                                                state: "Online"
                                            })
                                        }
                                    })
                                }
                            }
                        } else {
                            var cons = await inst.console("console", { endpoint: "exec", raw: config })

                            var index = ws.add(req.params.instance, cons) - 1
                            console.log(index)
                            console.log(ws.websockets)
                            console.info('ok boomer') // we need this tho shut i nee
                            res.send("Success")
                            db.collection('instances').add(req.params.instance, {
                                state: "Online"
                            })
                            var arr = ws.websockets
                            cons.operation.onmessage = async ({ data }) => {
                                consoleMessage(data, ws, inst)
                            }
                            ws.get(req.params.instance).ws.operation.onmessage = async ({ data }) => {
                                consoleMessage(data, ws, inst)

                            }
                        }
                    } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "vga") {
                        db.collection('instances').add(req.params.instance, {
                            state: "Starting"
                        })
                        if (await inst.state() == "Stopped") {
                            await inst.start()
                        }
                        var cons = await inst.console("vga", {})
                        ws.add(req.params.instance, cons)
                        db.collection('instances').add(req.params.instance, {
                            state: "Online"
                        })
                        res.send('Success')
                    } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "xterm") {
                        db.collection('instances').add(req.params.instance, {
                            state: "Starting"
                        })
                        if (await inst.state() == "Stopped") {
                            await inst.start()
                        }
                        var cons = await inst.console("console", { endpoint: "console" })
                        ws.add(req.params.instance, cons)
                        db.collection("instances").add(req.params.instance, {
                            state: "Online"
                        })
                        res.send('Success')
                        //texat console
                    } else if (inst.type() == "container" && araratInstance.relationships.magma_cube.stateless == false) {
                        db.collection('instances').add(req.params.instance, {
                            state: "Starting"
                        })
                        if (await inst.state() == "Stopped") {
                            await inst.start()
                        }
                        var cons = await inst.console("console", { endpoint: "console" })
                        ws.add(req.params.instance, cons)
                        db.collection('instances').add(req.params.instance, {
                            state: "Online"
                        })
                        res.send('Success')
                    }


                } else {

                }
            } catch (error) {


                console.log(error)
                return res.status(500).send("An error occured");

            }

            break;
        case "stop":
            try {
                console.log('stopping')
                db.collection('instances').add(req.params.instance, {
                    state: "Stopping"
                })
                if (req.body.force) {
                    if (req.body.force == true) {
                        res.send("Success")
                        try {
                            await client.client.put('/1.0/instances/' + inst.name() + '/state', {
                                "action": "stop",
                                "force": true,
                                "timeout": 30
                            })
                            db.collection('instances').add(req.params.instance, {
                                state: "Offline"
                            })
                        } catch {

                        }
                    } else {
                        res.send("Success")
                        try {
                            await client.client.put('/1.0/instances/' + inst.name() + '/state', {
                                "action": "stop",

                                "timeout": 30
                            })
                            db.collection('instances').add(req.params.instance, {
                                state: "Offline"
                            })
                        } catch {

                        }
                    }
                } else {
                    res.send("Success")
                    try {
                        await client.client.put('/1.0/instances/' + inst.name() + '/state', {
                            "action": "stop",

                            "timeout": 30
                        })
                        db.collection('instances').add(req.params.instance, {
                            state: "Offline"
                        })
                    } catch (error) {
                        console.log(error)
                        return res.status(500).send("An error occured");
                    }
                }
            } catch (error) {
                console.log(error)
                return res.status(500).send("An error occured");
            }

            break;
        case "restart":
            break;
    }
}
/**
 * {
 *   state: "stop"
 * }
 * really i think thats all we need right
 * req.params.instance == name
 */
module.exports = setState