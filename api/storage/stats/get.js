var { client, ararat } = require('../../../index')
const { convertID } = require('../../../lib/converter')
const Axios = require('axios').default
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    let err;
    try {
        var stats = await client.client.get('/1.0/storage-pools/'+req.params.uuid+'/resources')
    } catch (error) {
        err= error
        res.json({})
    }
   if (!err) {
    res.json(stats.metadata)
   }

}

