var { client } = require('../../index')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    try {
        var network = (await client.network('lxdbr0')).metadata
        res.json({ status: "Success", data: network.metadata, reason: null })
    } catch (error) {
        console.log(error)
        res.json({ status: "Error", data: {}, reason: null })
    }

}