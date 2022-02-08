const { client, ararat, ws: wss, db } = require('../../../index')
const { convertID } = require("../../../lib/converter")
async function control(ws, req) {
    try {
        const inst = await client.instance(convertID(req.params.instance))
        if (inst != null) {
            ws.on('message', (msg) => {
                console.log(msg)
                try {
                    var data = JSON.parse(msg)
                    switch (data.event) {
                        case "resize":
                            var cols = data.cols
                            var rows = data.rows
                            var control = wss.get(req.params.instance).ws.control
                            console.log({
                                evt: 'resize',
                                cols,
                                rows
                            })
                            control.send(JSON.stringify({ command: "window-resize", width: cols, height: rows }))

                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.log(error)
                    ws.send(JSON.stringify({ error: "Error while paring message" }))
                    ws.close()
                }

            })
        } else {
            ws.send(JSON.stringify({ error: "instance not found" }))
            ws.close()
        }
    } catch (error) {
        console.log(error);
        ws.send(JSON.stringify({ event: "error" }))
        return ws.close()
    }

}
module.exports = control