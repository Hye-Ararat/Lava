var { client } = require('../../index')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports =async function(req,res) {
    var instance = await client.instance(req.params.instance)
    if (instance == null) {
        res.json({status: "Error", data:{}, reason: "Instance not Found"})
    } else {
        res.json({status: "Success", data:instance._metadata, reason: null})
    }
}