const { client, lxd } = require('../../..');
const Axios = require('axios').default
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function createFolder(req, res) {
    try {
        var http = require('http')
        console.log('Create Folder')
        var s = new URL(lxd.url)
        console.log(s)
        var aa = await Axios.post("/1.0/instances/" + req.params.instance + "/files?path=" + req.query.path, {}, {
            socketPath: s.pathname,
            headers: {
                'X-LXD-type': 'directory'
            },
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
        return res.status(500).send("Failure")
    }


}
module.exports = createFolder