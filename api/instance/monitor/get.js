const { client, db } = require("../../../index");
const { convertID } = require("../../../lib/converter")
module.exports = async function monitor(req, res) {
    return new Promise((resolve, reject) => {
        try {
            const inst = await client.instance(convertID(req.params.instance))
            if (db.collection('instances').exist(req.params.instance) == false) {
                db.collection('instances').create(req.params.instance)
            }
            var usage = await inst.usage()
            var state_data = await inst.state()
            console.log(state_data)
            if (state_data = "Stopped" && db.collection('instances').get(req.params.instance).state != "Offline") {
                db.collection("instances").add(req.params.instance, {
                    state: "Offline"
                })
            } else if (state_data == "Running" && db.collection("instances").get(req.params.instance).state == "Ofline") {
                db.collection("instances").add(req, params.instance, {
                    state: "Online"
                })
            }
            res.json({
                ...usage,
                container_state: state_data,
                state: db.collection("instances").get(req.params.instance).state
            })
            resolve()
        } catch (error) {
            console.log(error)
            return res.status(500).send("An error occured");
        }


    })

}