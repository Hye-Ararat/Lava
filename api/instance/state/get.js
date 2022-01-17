const { client, db } = require("../../../index")
const { convertID } = require("../../../lib/converter")


module.exports = async function(req, res) {
    var inst = await client.instance(convertID(req.params.instance))
    res.json({
        containerState: await inst.state(),
        state: db.collection("instances").get(req.params.instance).state
    }
        )
}