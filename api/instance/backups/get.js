module.exports = async (req, res) => {
    const { client } = require("../../../index");
    const { convertID } = require("../../../lib/converter")
    try {
        res.setHeader('Content-disposition', 'attachment; filename=' + req.params.instance + ".tar.gz");
        //this is fetchable, we just need to add a function to the node module
        //res.setHeader("Content-Length", usage.disk.usage);
        var backup = await (await client.instance(convertID(req.params.instance))).downloadBackup(req.params.backup, res);
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occured");
    }
    return res;
}