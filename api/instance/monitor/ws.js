const { client, ararat, db, ws: wss } = require('../../../index')
const { Worker } = require("worker_threads");
const { convertID } = require('../../../lib/converter');
async function monitor(ws, req) {

    var authenticated = false;
    //console.log(convertID(req.params.instance))
    async function start() {
        const inst = await client.instance(convertID(req.params.instance))
        if (db.collection('instances').exist(req.params.instance) == false) {
            db.collection('instances').create(req.params.instance)
            db.collection("instances").add(req.params.instance, {
                state: "Offline"
            })
        }
        //console.log(db.collection('instances').get(req.params.instance))

        var usage = await inst.usage()
        var state = await inst.state()
        if (state == "Stopped" && db.collection('instances').get(req.params.instance).state == "Online") {
            db.collection('instances').add(req.params.instance, {
                state: "Offline"
            })
        }
        if (state == "Running" && db.collection('instances').get(req.params.instance).state == "Offline") {
            db.collection('instances').add(req.params.instance, {
                state: "Online"
            })
        }

        ws.send(JSON.stringify({
            ...usage,
            containerState: state,
            state: db.collection('instances').get(req.params.instance).state
        }))
        var e = setInterval(async () => {
            var state = await inst.state()
            var usage = await inst.usage()
            if (usage.cpu < 0) return;
            //console.log(state)
            ws.send(JSON.stringify({
                ...usage,
                containerState: state,
                state: db.collection('instances').get(req.params.instance).state
            }))
            wss.get(req.params.instance)
            console.log({
                real: state,
                ...db.collection('instances').get(req.params.instance)
            })
            if (state == "Running" && db.collection('instances').get(req.params.instance).state == "Offline") {
                db.collection('instances').add(req.params.instance, {
                    state: "Online"
                })
            }
            if (state == "Stopped" && db.collection('instances').get(req.params.instance).state == "Online") {
                db.collection('instances').add(req.params.instance, {
                    state: "Offline"
                })
            }
            if (state == "Running" && !wss.get(req.params.instance)) {
                var cons = await inst.console("console", { endpoint: "console" })
                wss.add(req.params.instance, cons)
                db.collection('instances').add(req.params.instance, {
                    state: "Online"
                })

            }

        }, 1000)
        ws.on('close', () => {
            clearInterval(e)
        })
    }
    ws.on("message", async (s) => {
        console.log(JSON.stringify(s))
        console.log(s.toString())
        if (authenticated == false) {
            try {
                var araratInstance = await ararat.instance(req.params.instance);
                var allowed = await araratInstance.monitor().verify(s.toString())
            } catch {
                console.log("rejected 1")
                return ws.reject()
            }
            if (allowed == false) {
                console.log("rejected 2")
                return ws.reject()
            }
            if (allowed == true) {
                console.log("allowed")
                authenticated = true;
                start()
            }
        }
    })
}
module.exports = monitor