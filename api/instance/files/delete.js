const { client, lxd } = require('../../..');
const Axios = require('axios').default
const {convertID} = require('../../../lib/converter')
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function deleteFolder(req, res) {
    try {
        var http = require('http')
        console.log('Delete Folder')
        var s = new URL(lxd.url)
        console.log(s)
        var aa = await Axios.delete("/1.0/instances/" + convertID(req.params.instance) + "/files?path=" + req.query.path, {
            socketPath: s.pathname,
            validateStatus: (status) => {
                return true
            }
        })
        console.log(aa.data)
        if (aa.data.status == "Success" && aa.data.status_code == 200) {
            res.send("Success")
        } else {
            res.status(500).send("Failure")
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send("Failure")
    }


}
module.exports = deleteFolder