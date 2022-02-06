const { client, lxd } = require('../../..');
const Axios = require('axios').default
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function createSnapshot(req, res) {
   var inst = await client.instance(req.params.instance)
   if (inst == null) {
      res.send("Instance not found")
   } else {
       var snapshots = await inst.createSnapshot(req.body.name)
       //console.log(snapshots)
       res.json(snapshots)
   }
    
}
module.exports = createSnapshot