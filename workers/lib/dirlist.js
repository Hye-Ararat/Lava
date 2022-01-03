var {workerData, parentPort} = require('worker_threads')
async function sort() {
   var s = await workerData.do()
    parentPort.postMessage(s);
}
sort()