var { client } = require('../../../index')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports =async function(req,res) {
    if (!req.body.listen_address || !req.body.ports) return res.status(400).send("Malformed request")
    var network = await client.network(req.bridge)
    network.createNetworkForward()
}