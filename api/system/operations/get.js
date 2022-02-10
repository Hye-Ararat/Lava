var { client, ararat } = require('../../../index')
const { convertID } = require('../../../lib/converter')
const Axios = require('axios').default
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
   try {
      const operations = await client.client.get('/1.0/operations?recursion=1')
      res.json(operations.metadata)
   } catch (error) {
      console.log(error)
      return res.status(500).send("An error occured");
   }

}