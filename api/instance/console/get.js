const { ararat } = require("../../../index")
async function spice(req, res) {
    var node = await (await ararat.instance(req.params.instance, ["node"])).relationships.node;
    var full = node.address.ssl ? "https" : "http" + node.address.hostname + ":" + node.address.port
    res.render('spice', { server: req.params.instance, address: full })
}
module.exports = spice