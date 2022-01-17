const { client } = require("../../../..")
const { convertID } = require("../../../../lib/converter")


async function getType(req,res) {
            //console.log('dirlist')
            const url = encodeURI("/1.0/instances/"+convertID(req.params.instance)+"/files?path=" + req.query.path)
            const { data, headers } = await client.client.axios({
                url,
                validateStatus: false
            })
            //console.log(data)
            if (headers['x-lxd-type'] == "directory") { 
                res.json({type: "directory"})
            } else { 
               res.json({type: "file"})
            }
}
module.exports = getType