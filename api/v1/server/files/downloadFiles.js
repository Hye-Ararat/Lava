const { getType } = require("../../../../lib/server/getType");

async function downloadFiles(req, res) {
  var type = await getType(req.params.server);
  if (type == "N-VPS") {
    //To Be Added
  }
  if (type == "docker") {
    const DockerClient = new (require("dockerode"))();
    const fs = require("fs");
    var container = DockerClient.getContainer(req.params.server);
    container.inspect(function (err, container_data) {
      if (err) {
        res.send(err.message);
      } else {
        var basepath = container_data.Mounts[0].Source;
        var path;
        req.query.path ? (path = basepath + req.query.path) : (path = basepath);
        console.log(path);
        fs.lstat(path, (err, stats) => {
          if (err) {
            res.send(err.message);
          } else {
            console.log(stats.isDirectory());
            try {
              if (stats.isDirectory()) {
                res.send("Cannot Download A Directory");
              } else {
                console.log(path);
                res.download(path);
              }
            } catch (error) {
              res.send(error);
            }
          }
        });
      }
    });
  }
  if (type == "KVM") {
    //To Be Added
  }
}

module.exports = { downloadFiles };
