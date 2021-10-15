const ews = require("express-ws");
const { getType } = require("../../../lib/server/getType");

async function serverConsole(ws, req) {
  console.log("YES")
  var type = await getType(req.params.uuid);

  const { docker: Docker } = require("../../../index.js");
  console.log(type)
  if (type == "docker") {
    const container = Docker.getContainer(req.params.uuid);

        setTimeout(() => {
            var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true, logs: false};
            container.attach(attach_opts, function handler(err, stream) {
             /*  var isRaw = process.isRaw;
              process.stdin.setRawMode(true);
              process.stdin.setEncoding('utf8'); */
/*               // Show outputs
              stream.pipe(process.stdout);
          
              // Connect stdin
              process.stdin.resume();
              process.stdin.setEncoding('utf8');
              process.stdin.setRawMode(true);
              process.stdin.pipe(stream);
              setTimeout(() => {
                  stream.write('pl\n')
              }, 4000); */
              /* stream.on('data', (data) => {
                console.log(data.toString())
                if (data == ">...."){
                  console.log('blocked')
                } else {
                  ws.send(data);
                }
              }) */
              container.logs({follow: true, stdout: true, stderr: true}, function(err, streamlogs){
                streamlogs.on('data', (data) => {
                  ws.send(data)
                })
                ws.on("message", function (msg) {
                  console.log(msg)
                  ws.send(`${msg}\n`)
                  stream.write(`${msg}\n`)
                });
              })
              //ws.pipe(process.stdout); THIS DOES NOT WORK

          
              container.start(function(err, data) {
       

          
                container.wait(function(err, data) {
                  exit(stream, isRaw);
                });
              });
            });

       
      });
  }
}

module.exports = { serverConsole };
