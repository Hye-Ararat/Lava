const { client, ararat, ws: wss, db } = require('../../../index')
const { convertID } = require("../../../lib/converter")
const colors = require("colors")
function isJson(str) {
   try {
       JSON.parse(str);
   } catch (e) {
       return false;
   }
   return true;
}

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

                  araratInstance.relationships.magma_cube.states.running.forEach(sta => {


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
         console.log("awaiting status for console")
         console.log(wss.websockets)
         if (wss.get(req.params.instance) && state == "Running") {
            console.log("is running for console")
            clearInterval(interval);

            ws.send("\r\n")
            var proxy = wss.get(req.params.instance).ws.proxy(ws)
            console.log("proxied console to user")
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
      var instance = await client.instance(convertID(req.params.instance))
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
      var authlisten = async (data) => {
         if (isJson(data.toString())) {
            try {
               var s = JSON.parse(data.toString())
               console.log(s)
               if (s.event == "authenticate") {
                  var token = s.data;
                  var Instance = await ararat.instance(req.params.instance, ["magma_cube"])
                  if(await Instance.console().verify(token)) {
                     console.log('start console')
                     ws.removeEventListener("message", authlisten)
                     startExecConsole()
                  } else {
                     console.log("Not Authed")
                  }
               }
            } catch (error) {
               console.log(error)
            }
         }

      }
      ws.send(JSON.stringify({event: "ready"}))
      ws.on('message',authlisten)

   } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "vga") {
      startVGAConsole()
   } else if (inst.type() == "virtual-machine" && araratInstance.relationships.magma_cube.console == "xterm") {
      var authlisten = async (data) => {
         if (isJson(data.toString())) {
            try {
               var s = JSON.parse(data.toString())
               console.log(s)
               if (s.event == "authenticate") {
                  var token = s.data;
                  var Instance = await ararat.instance(req.params.instance, ["magma_cube"])
                  if(await Instance.console().verify(token)) {
                     console.log('start console')
                     ws.removeEventListener("message", authlisten)
                     startSerialConsole()
                  } else {
                     console.log("Not Authed")
                  }
               }
            } catch (error) {
               console.log(error)
            }
         }

      }
      ws.send(JSON.stringify({event: "ready"}))
      ws.on('message',authlisten)
   } else if (inst.type() == "container" && araratInstance.relationships.magma_cube.stateless == false) {
      console.log('start serial123123 console')
     
      var authlisten = async (data) => {
         console.log("SDLFKJD:LKFL")
         //console.log(data.toString())
         if (isJson(data.toString())) {
            try {
              // console.log(data.toString())
               var s = JSON.parse(data.toString())
               //console.log(s)
               if (s.event == "authenticate") {
                  var token = s.data;
                  var Instance = await ararat.instance(req.params.instance, ["magma_cube"])
                  if(await Instance.console().verify(token)) {
                     console.log('start console')
                     ws.removeEventListener("message", authlisten)
                     startSerialConsole()
                  } else {
                     console.log("Not Authed")
                  }
               }
            } catch (error) {
               console.log(error)
            }
         } else {
            console.log("Is not JSON")
         }

      }
      ws.send(JSON.stringify({event: "ready"}))
      ws.on('message', (data) => {
         console.log("GOT LE DATA")
         console.log(data)
         authlisten(data)
      })
   }

}
module.exports = consoles