var https = require('https')
var fs = require('fs');
const { client, lxd } = require('../../..');
const { convertID } = require('../../../lib/converter');

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @param {string} path 
 * @returns 
 */
async function start(req, res, name, path) {
    return new Promise(async (resolve, reject) => {
        console.log(lxd)
        if (lxd.unix == false) {
            try {
                var s = new URL(lxd.url)
                var request = https.request({
                    method: "POST",
                    hostname: s.host,
                    port: s.port,
                    path: encodeURI("/1.0/instances/" + name + "/files?path=" + path),
                    headers: {
                        "Content-Type": `application/octet-stream`
                    },
                }, function (response) {
                    response.on('data', d => {
                        const output = JSON.parse(d);
                        resolve(output)
                        console.log('done')
                    })
                });
                request.on('error', error => {
                    reject(error)
                })
                var streamifier = require('streamifier')

                streamifier.createReadStream(Buffer.from(req.body)).pipe(request)
            } catch (error) {
                console.log(error)
                reject(error)
            }
        } else {
            try {
                var http = require('http')
                console.log('unix')
                var s = new URL(lxd.url)
                console.log(s)
                var request = http.request({
                    method: "POST",
                    socketPath: s.pathname,
                    path: encodeURI("/1.0/instances/" + name + "/files?path=" + path),
                    headers: {
                        "Content-Type": `application/octet-stream`
                    },
                }, function (response) {
                    response.on('data', d => {
                        const output = JSON.parse(d);
                        resolve(output)
                        console.log('done')
                    })
                });
                request.on('error', error => {
                    reject(error)
                })
                var streamifier = require('streamifier')

                streamifier.createReadStream(Buffer.from(req.body)).pipe(request)
            } catch (error) {
                console.log(error)
                reject(error)
            }
        }


    })

}
function upload(req, res) {
    console.log('upload')
    console.log(req.body)
    try {
        start(req, res, convertID(req.params.instance), req.query.path)
    } catch (error) {
        console.log(error)
        return res.status(500).send("An error occured")
    }
    return res.send("Success")
}
module.exports = upload