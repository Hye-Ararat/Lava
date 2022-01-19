const { client } = require("../..")
const { convertID } = require("../../lib/converter")

module.exports = async function (req, res) {
    const instance = await client.instance(convertID(req.params.instance))
    if (!instance) {
        return res.send("Instance not found")
    }
    const state = await instance.state();
    if (state != "Stopped") {
        await instance.stop();
    }
    await instance.delete();
    res.send("Deleted.");
}