var { client } = require("../../../index");
const { convertNetworkID, convertTunnelNetworkID } = require("../../../lib/converter")

module.exports = async function (req, res) {
    const network = await client.network(convertNetworkID(req.body.localID));
    var config = {}
    config["tunnel." + convertTunnelNetworkID(req.body.remoteID) + ".protocol"] = "gre";
    config["tunnel." + convertTunnelNetworkID(req.body.remoteID) + ".local"] = req.body.local,
        config["tunnel." + convertTunnelNetworkID(req.body.remoteID) + ".remote"] = req.body.remote
    try {
        await network.updateNetworkConfig(config)
    } catch (error) {
        return res.status(500).send(error);
    }
    return res.status(200).send("Success")
}