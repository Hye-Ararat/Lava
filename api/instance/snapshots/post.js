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
   var inst = await client.instance(convertID(req.params.instance))
   if (inst == null) {
      res.send("Instance not found")
   } else {
      var snapshots = await inst.createSnapshot(req.body.name, false)
      res.status(200).send("success");
   }

}
module.exports = createSnapshot