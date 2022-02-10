var { client } = require('../../../index')
const { convertNetworkID } = require('../../../lib/converter')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    try {
        console.log(convertNetworkID(req.body.network))
        if (!req.body.listen_address || !req.body.ports) return res.status(400).send("Malformed request")
        var network = await client.network(convertNetworkID(req.body.network))
        network.createNetworkForward(req.body.listen_address, req.body.description)
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }

}