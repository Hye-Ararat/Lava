module.exports = async (req, res) => {
    const { client } = require("../../../index");
    const { convertID } = require("../../../lib/converter");
    const { ararat } = require("../../../index");
    try {
        var backup = await (await client.instance(convertID(req.params.instance))).scheduleBackup(req.body.name);
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }
    res.status(200).send("Success");
    backup.on("completed", async () => {
        console.log("finished");
        try {
            (await ararat.instance(req.params.instance)).backup(req.body.name).setState(false);
        } catch (error) {
            console.log(error);
        }
        console.log("actually done")
    })
}