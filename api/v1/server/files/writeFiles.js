const { addAudit } = require("../../../../lib/server/addAudit");
const { getType } = require("../../../../lib/server/getType");
const sanitize = require("sanitize-filename");
/**
 * Write Server Files
 * @param {*} req
 * @param {*} res
 */
async function writeFiles(req, res) {
  var type = await getType(req.params.uuid);
  if (type == "N-VPS") {
    res.send("N-VPS");
    //Type is N-VPS
  } else if (type == "docker") {
    console.log(req.body);
    const DockerClient = new (require("dockerode"))();
    const fs = require("fs");
    var container = DockerClient.getContainer(req.params.uuid);
    container.inspect(function (err, container_data) {
      var server_name = container_data.Name.replace("/", "");
      if (err) {
        res.send(err.message);
      } else {
        var basepath = container_data.Mounts[0].Source;
        var path;
        req.query.path
          ? (path = basepath + sanitize(req.query.path))
          : (path = basepath);
        console.log(path);
        fs.lstat(path, (err, stats) => {
          if (err) {
            res.send(err);
          } else {
            try {
              if (stats.isDirectory()) {
                res.send("Cannot Write Directory! Must write file.");
              } else {
                fs.writeFile(path, req.body, function (err) {
                  if (err) {
                    res.send(err.message);
                  } else {
                    res.send("Success");
                    addAudit(server_name, {
                      type: "file",
                      action: "write",
                      path: sanitize(req.query.path),
                      user: "12345",
                    });
                  }
                });
              }
            } catch (error) {
              res.json({
                status: "error",
                data: error.message,
              });
            }
          }
        });
      }
    });
    //Type is Docker
  } else if (type == "KVM") {
    res.send("KVM");
    //Type is KVM
  } else {
    res.json({
      status: "error",
      message: "Invalid Type!",
    });
  }
}

module.exports = { writeFiles };
