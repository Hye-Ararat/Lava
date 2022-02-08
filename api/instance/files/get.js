const { client, ararat, ws: wss, db } = require('../../../index')
const { convertID } = require("../../../lib/converter");
const { getDirList } = require('../../../lib/dirlist');
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function download(req, res, path, name) {
    if (await client.instance(convertID(name)) == null) return;
    return new Promise(async (resolve, reject) => {
        try {
            if (!path) return reject(new Error('Path not defined'))
            const url = encodeURI("/1.0/instances/" + convertID(name) + "/files?path=" + path)
            //console.log(url)
            //console.log('ok')
            const { data, headers } = await client.client.axios({
                url,
                method: 'GET',
                responseType: 'stream'
            })
            //console.log(headers)
            if (data.headers["content-type"] == "application/json") {


                resolve({
                    type: 'dir',
                    list: await getDirList(name, path)
                })


            } else {
                resolve({ type: 'file', content: data.headers["content-type"] })
                res.header('content-type', data.headers["content-type"])
                res.header('Content-Disposition', data.headers["content-disposition"])
                data.pipe(res)

            }
        } catch (error) {
            reject(error)
        }

    })


}
/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns 
 */
async function downloadfile(req, res) {
    try {
        //console.log(req.query)
        var s = await download(req, res, req.query.path, req.params.instance)
        if (s.type == "dir") {
            res.json(s)
        }
    } catch (error) {
        return res.status(500).send("An error occured");
    }

}
module.exports = downloadfile