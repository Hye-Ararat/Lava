const { client, ararat, ws: wss, db } = require('../../../index')
const { convertID } = require("../../../lib/converter")
const colors = require("colors")
async function consoles(ws, req) {
   var inst = await client.instance(convertID(req.params.instance))
   if (inst == null) return;
   var araratInstance = await ararat.instance(req.params.instance, ["magma_cube"])
   if (araratInstance == null) return;
   function startExecConsole() {
      var offlineMessage = false;
      var interval = setInterval(async () => {
         var state = await inst.state()
         if (wss.get(req.params.instance) && state == "Running") {
            clearInterval(interval);

            ws.send("\r\n")
            var proxy = wss.get(req.params.instance).ws.proxy(ws)
            wss.get(req.params.instance).ws.operation.onmessage = async ({ data }) => {
               if (data == "") {
                  var arr = wss.websockets;
                  var item = wss.get(req.params.instance)
                  arr.splice(arr.indexOf(item), 1)
                  wss.set(arr)
                  try {
                     await inst.stop();
                  } catch {
                     try {
                        await inst.stop(true);
                     } catch {

                     }
                  }
                  db.collection('instances').add(req.params.instance, {
                     state: "Offline"
                  })
                  //startExecConsole()
               } else {

                  araratInstance.relationships.magma_cube.images[araratInstance.magma_cube.image_group][araratInstance.magma_cube.image_index].states.running.forEach(sta => {


                     if (data.toString().includes(sta)) {

                        db.collection('instances').add(req.params.instance, {
                           state: "Online"
                        })
                     }
                  })
               }
            }
            ws.on('close', () => {
               proxy.close()
            })
            if (offlineMessage == true) {

            }
            offlineMessage = false;
         } else if (offlineMessage == false) {
            offlineMessage = true;

         }
      }, 1000)
   }
   function startSerialConsole() {
      var offlineMessage = false;
      var interval = setInterval(async () => {
         var state = await inst.state()
         console.log(wss.websockets)
         if (wss.get(req.params.instance) && state == "Running") {
            clearInterval(interval);

            ws.send("\r\n")
            var proxy = wss.get(req.params.instance).ws.proxy(ws)
            var st = setInterval(async () => {
               if (await inst.state() == "Stopped") {
                  var arr = wss.websockets
                  var item = wss.get(req.params.instance)
                  arr.splice(arr.indexOf(item), 1)
                  wss.set(arr)
                  clearInterval(st)
               }

            }, 2000);
            wss.get(req.params.instance).ws.operation.onmessage = async ({ data }) => {
               // if (data.toString().includes('login')) wss.get(req.params.instance).ws.operation.send('\n')
               if (data == "") {
                  var arr = wss.websockets;
                  var item = wss.get(req.params.instance)
                  arr.splice(arr.indexOf(item), 1)
                  wss.set(arr)
                  try {
                     await inst.stop();
                  } catch {
                     try {
                        await inst.stop(true);
                     } catch {

                     }
                  }
                  db.collection('instances').add(req.params.instance, {
                     state: "Offline"
                  })
                  //startExecConsole()
               }
            }
            ws.on('close', () => {
               proxy.close()
            })
            if (offlineMessage == true) {

            }
            offlineMessage = false;
         } else if (offlineMessage == false) {
            offlineMessage = true;

         }
      }, 1000)
   }
   async function startVGAConsole() {
      var instance = await client.instance(convertID( req.params.instance))
      var consoles = await instance.console("vga")
      consoles.operation.onmessage = (s) => {
         ws.send(s.data)
      }
      ws.on('message', (s) => {
         consoles.operation.send(s)
      })
      ws.on('close', () => {
          console.log(consoles.operation.listenerCount("message"))
          console.log('close')

      })

   }
   console.log(inst.type())
   if (inst.type() == "container" && araratInstance.relationships.magma_cube.stateless == true) {
      startExecConsole()
   } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "vga") {
      startVGAConsole()
   } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "xterm") {
      //texat console
   } else if (inst.type() == "container" && araratInstance.relationships.magma_cube.stateless == false) {
      console.log('start serial console')
      startSerialConsole()
   }

}
module.exports = consoles