const { getType } = require("../../../../lib/server/getType");

/**
 * Deletes File
 * @param {req}
 * @param {res}
 */
async function deleteFiles(req, res) {
  console.log(req.params.server)
  console.log("HIT")
  var type = await getType(req.params.server);
  console.log(type)
  if (type == "N-VPS") {
    //Type is N-VPS
  } else if (type == "KVM") {
    //Type is KVM
  } else if (type == "docker") {
    const DockerClient = new (require("dockerode"))();
    const fs = require("fs");
    var container = DockerClient.getContainer(req.params.server);
    container.inspect((err, container_data) => {
      if (err) {
        console.log(err);
        res.send(err.message);
      } else {
        var basepath = container_data.Mounts[0].Source;
        var path;
        req.query.path ? (path = basepath + req.query.path) : (path = basepath);
        console.log(path);
        fs.lstat(path, (err, stats) => {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            try {
              if (stats.isDirectory()) {
                fs.rm(path, { recursive: true }, function (err) {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    res.send("Success");
                  }
                });
              } else {
                fs.unlink(path, function (err) {
                  if (err) {
                    console.log(err);
                    res.send(err);
                  } else {
                    res.send("Success");
                  }
                });
              }
            } catch (error) {
              console.log(error);
              res.send(error);
            }
          }
        });
      }
    });
  } else {
    res.send("Server does not exist!")
  }
}

module.exports = { deleteFiles };
