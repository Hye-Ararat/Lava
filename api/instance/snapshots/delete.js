const { client, lxd } = require('../../..');
const Axios = require('axios').default
const { convertID } = require("../../../lib/converter");
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function createSnapshot(req, res) {
    try {
        var inst = await client.instance(convertID(req.params.instance))
        if (inst == null) {
            res.send("Instance not found")
        } else {
            var snapshots = await inst.deleteSnapshot(req.params.uuid)
            //console.log(snapshots)
            return res.status(200).send("Success")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured");
    }



}
module.exports = createSnapshot