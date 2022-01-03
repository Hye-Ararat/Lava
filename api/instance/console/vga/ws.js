const { client, ararat, ws: wss, db } = require('../../../../index')
const { convertID } = require("../../../../lib/converter")
async function s(ws, req) {

    console.log('Created new VGA Socket')
    var instance = await client.instance(convertID(req.params.instance))
    var consoles = await instance.console("vga", {})
    consoles.operation.onopen = () => {
        ws.on('message', (data) => {
            consoles.operation.send(data, { binary: true })
        })
        var s = (data) => {
            ws.send(data, { binary: true })
        }
        consoles.operation.on('message', s)
        ws.on('close', () => {
            console.log(consoles.operation.listenerCount("message"))
            console.log('close')
        })
    }




}
module.exports = s