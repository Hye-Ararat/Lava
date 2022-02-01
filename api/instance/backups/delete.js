module.exports = async (req, res) => {
    const { client } = require("../../../index");
    const { convertID } = require("../../../lib/converter");
    try {
        await (await client.instance(convertID(req.params.instance))).deleteBackup(req.params.backup);
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occured");
    }
    return res.status(200).send("Success");
}