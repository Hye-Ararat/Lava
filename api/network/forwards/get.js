var { client } = require('../../../index')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports =async function(req,res) {
    
    var network = await client.network(req.bridge)
    console.log(await network.fetchNetworkForwards())
    if (network == null) {
        res.json({status: "Error", data:{}, reason: "Network not Found"})
    } else {
        res.json({status: "Success", data: await network.fetchNetworkForwards(), reason: null})
    }
}