const { client, db } = require("../../../index")
const { convertID } = require("../../../lib/converter")


module.exports = async function (req, res) {
    try {


        var inst = await client.instance(convertID(req.params.instance))
        res.json({
            containerState: await inst.state(),
            state: db.collection("instances").get(req.params.instance).state
        }
        )
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }

}