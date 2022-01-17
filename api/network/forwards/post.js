var { client } = require('../../../index')
const { convertNetworkID } = require('../../../lib/converter')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports =async function(req,res) {
    console.log(convertNetworkID(req.body.network))
    if (!req.body.listen_address || !req.body.ports) return res.status(400).send("Malformed request")
    var network = await client.network(convertNetworkID(req.body.network))
    network.createNetworkForward(req.body.listen_address, req.body.description)
}