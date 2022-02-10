const { client, lxd } = require('../../..');
const Axios = require('axios').default
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function getSnapshots(req, res) {
   try {
      var inst = await client.instance(req.params.instance)
      if (inst == null) {
         res.send("Instance not found")
      } else {
         var snapshots = await inst.listSnapshot()
         res.json(snapshots)
      }
   } catch (error) {
      console.log(error)
      return res.status(500).send("An error occured");
   }



}
module.exports = getSnapshots