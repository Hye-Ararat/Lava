const { client } = require("../..")
const { convertID } = require("../../lib/converter")

module.exports = async function (req, res) {
    try {
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
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }
    
    return res.status(200).send("Success");

}
