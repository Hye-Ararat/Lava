const { client } = require("../../../..")
const { convertNetworkID } = require("../../../../lib/converter")

module.exports = async function(req, res) {
    console.log(req)
    console.log(convertNetworkID(req.params.bridge))
    console.log(req.body)
    console.log(req.params.bridge)
    try {
       await client.network(convertNetworkID(req.params.bridge)).appendNetworkForward(req.body.listen_address, req.body.ports)
    } catch (error) {
        console.log(error.data.error)
        return res.status(500).send(error.data.error)
    }
    return res.status(200).send("Success")
}