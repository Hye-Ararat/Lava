const Client = require("@wolfogaming/node-lxd")(null, {});
const Docker = new (require("dockerode"))();
async function listServer(req, res) {
  if (!req.query.type) {
    Client.containers(false, async function (error, container) {
      var err = {};
      try {
        var a = await Docker.listContainers();
      } catch (error) {
        err.docker = error;
      }
      if (error) err.lxd = error;
      if (err.docker || err.lxd)
        return res.json({ status: "error", data: err });
      res.json({ status: "success", data: { docker: a, lxd: container } });
    });
  } else if (req.query.type) {
    var type = req.query.type;
    if (type != "docker" || type != "N-VPS" || type != "Minecraft")
      return res.json({
        status: "error",
        data: "No type specified must be <docker | N-VPS | Minecraft>",
      });
    if (type == "docker") {
      Docker.listContainers().then((containers) => {
        res.json({ status: "success", data: containers });
      });
    } else if (type == "N-VPS") {
      Client.containers(false, (error, containers) => {
        res.json({ status: "success", data: containers });
      });
    } else if (type == "Minecraft") {
      Docker.listContainers().then((containers) => {
        res.json({ status: "success", data: containers });
      });
    }
  }
}
module.exports = { listServer };
