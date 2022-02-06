var { client, ararat } = require('../../index')
const { convertID } = require('../../lib/converter')
const Axios = require('axios').default
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
   const storage = await client.client.get('/1.0/storage-pools?recursion=1')
   res.json(storage.metadata)
}