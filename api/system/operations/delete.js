var { client, ararat } = require('../../../index')
const { convertID } = require('../../../lib/converter')
const Axios = require('axios').default
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
   const operations = await client.client.delete('/1.0/operations/' + req.params.uuid)
   res.json(operations.metadata)
}