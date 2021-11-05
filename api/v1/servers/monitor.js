const {Worker} = require("worker_threads");
const getType = require("../../../lib/server/getType");
/**
 * Monitor Websocket for server statistics
 * @param {import('ws').WebSocket} ws
 * @param {import('express').Request} req
 */
 async function monitorWS(ws, req) {
   const axios = require("axios");
   var type = await getType(req.params.server);
   console.log(type)
   const worker = new Worker("./workers/api/v1/servers/monitor.js", {
     workerData: {
       server: req.params.server,
       type: type
     }
   })
   worker.on("message", (data) => {
      ws.send(JSON.stringify(data));
   })
   ws.on("close", () => {
     worker.terminate();
   })

}
module.exports = monitorWS;