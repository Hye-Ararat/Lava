var SystemUsage = [];
const Nou = require("node-os-utils");
const Client = require("../index.js").lxd;
async function getUsage() {
  return new Promise((accept) => {
    Client.info(async (error, info) => {
      if (error){
        console.log(error);
      } else {
        accept({
          version: process.env.VERSION,
          cpu: Nou.cpu.model(),
          cpu_threads: Nou.cpu.count(),
          total_memory: Nou.mem.totalMem(),
          architecture: Nou.os.arch(),
          os: await Nou.os.oos(),
          uptime: Nou.os.uptime(),
          current: {
            cpu_usage: await Nou.cpu.usage(),
            mem_usage: await Nou.mem.used(),
            disk_usage: await Nou.drive.used(),
            net_usage: await Nou.netstat.inOut(),
            net_used: await Nou.netstat.stats(),
          },
          lxc: info,
        });
      }

    });
  });
}
async function execute() {
  SystemUsage.push(await getUsage());
  setInterval(async () => {
    SystemUsage.push(await getUsage());
  }, 6000);
}

module.exports = {
  data: SystemUsage,
  execute: execute,
};
