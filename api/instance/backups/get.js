module.exports = async (req, res) => {
    const { client } = require("../../../index");
    const { convertID } = require("../../../lib/converter")
    try {
        var backup = await (await client.instance(convertID(req.params.instance))).downloadBackup(req.params.backup, res);
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occured");
    }
    return res;
}