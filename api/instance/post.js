var { client, ararat } = require('../../index')
const { convertID } = require('../../lib/converter')
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
module.exports = async function (req, res) {
    try {
        if (!req.body.id) return res.json({ status: "Error", data: {}, reason: "id field not specified" })
        var { id } = req.body
        var check = await client.instance(id)
        if (check == null) {
            var magma_cube = await ararat.instance(id, ["magma_cube", "network_container"])
            var internalID = convertID(id)
            var inst = await client.create('jdk', {
                "type": "image",                                      
                "mode": "pull",                                       
                "server": "https://images.speed.hye.gg:8443",                 
                "protocol": "lxd",                                                           
                "alias": "openjdk/17/x86_64"
            }, {"devices": {
                "root": {
                  "path": "/",
                  "pool": "defaultdir",
                  "type": "disk"
                }
              }})
            inst.on('progress', p => {
                console.log(p)
            })
            inst.on('error', (err) => {
                console.log(err)
            })
            inst.on('finished', () => {
                console.log('ok')
            })
            //var instance = await client.create(internalID, )
        } else {
            res.json({ status: "Error", data: {}, reason: "Instance already exists" })
        }
    } catch (error) {
        if (error.request) {
            res.json({ status: "Error", data: {}, reason: error.request.data })
        } else {
            if (process.env.DEBUG) {
                console.log(error)
                res.json({ status: "Error", data: {}, reason: error.message })
            } else {
                res.json({ status: "Error", data: {}, reason: "" })
            }
        }

    }

}