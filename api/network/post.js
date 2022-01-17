var { client } = require("../../index");
const { convertNetworkID } = require("../../lib/converter");

module.exports = async function (req, res) {
    try {
        await client.createBridge(convertNetworkID(req.body.id), {
            "ipv4.nat": "true",
            "ipv6.nat": "true",
            "ipv4.nat.address": req.body.address.ipv4 ? req.body.address.ipv4 : "",
            "ipv6.nat.address": req.body.address.ipv6 ? req.body.address.ipv6 : ""
        })
    } catch (error){
        console.log(error)
        return res.status(500).send(error.message);
    }
    if (req.body.address.ipv4) {
        try {
            var network = await client.network(convertNetworkID(req.body.id)).createNetworkForward(req.body.address.ipv4)
        } catch (error){
            console.log(error)
            return res.status(500).send(error.message);
        }
    }
    return res.status(200).send("Success")
}