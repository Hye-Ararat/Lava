const Nou = require("node-os-utils");
async function resources(req, res) {
  res.json({
    memory: {
      total: Nou.mem.totalMem(),
      allocated: 0,
    },
    cpu: {
      total: Nou.cpu.count() * 100, //* 100 (percent calculation?)
      allocated: 0,
    },
    disk: {
      total: (await Nou.drive.info()).totalGb * 1024,
      allocated: 0,
    },
  });
}
module.exports = {
  resources,
};
