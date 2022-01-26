var { client } = require("../../index");
const { convertNetworkID, convertTunnelNetworkID } = require("../../lib/converter");

module.exports = async function (req, res) {
    let config;
    if (req.body.remote.remote != true || req.body.remote.primary == true) {
        config = {
            "ipv4.nat": "true",
            "ipv6.nat": "true",
            "ipv4.nat.address": req.body.address.ipv4 ? req.body.address.ipv4 : null,
            "ipv6.nat.address": req.body.address.ipv6 ? req.body.address.ipv6 : null,
        }
    }
    if (req.body.remote.remote == true && req.body.remote.primary == false) {
        config = {
            "ipv4.address": null,
            "ipv6.address": null,
        }
        config["tunnel." + convertTunnelNetworkID(req.body.remote.primaryNetwork) + ".protocol"] = "gre"
        config["tunnel." + convertTunnelNetworkID(req.body.remote.primaryNetwork) + ".local"] = req.body.address.ipv4
        config["tunnel." + convertTunnelNetworkID(req.body.remote.primaryNetwork) + ".remote"] = req.body.remote.address.ipv4
    }
    try {
        await client.createBridge(convertNetworkID(req.body.id), config)
    } catch (error) {
        console.log(error)
        return res.status(500).send(error.message);
    }
    if (req.body.address.ipv4) {
        try {
            var network = await client.network(convertNetworkID(req.body.id)).createNetworkForward(req.body.address.ipv4)
        } catch (error) {
            console.log(error)
            return res.status(500).send(error.message);
        }
    }
    return res.status(200).send("Success")
}
