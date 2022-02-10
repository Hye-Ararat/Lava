const { ararat } = require("../../../index")
async function spice(req, res) {
    try {
        var node = await (await ararat.instance(req.params.instance, ["node"])).relationships.node;
        var full = (node.address.ssl ? "wss" : "ws") + "://" + node.address.hostname + ":" + node.address.port
        res.render('spice', { server: req.params.instance, address: full })
    } catch (error) {
        console.log(error);
        return res.status(500).send("An error occured");
    }

}
module.exports = spice