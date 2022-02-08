var { client } = require('../../index')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    try {
        var instance = await client.instance(req.params.instance)
        if (instance == null) {
            res.json({ status: "Error", data: {}, reason: "Instance not Found" })
        } else {
            res.json({ status: "Success", data: instance._metadata, reason: null })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }

}