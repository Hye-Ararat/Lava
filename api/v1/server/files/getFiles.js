const { getType } = require("../../../../lib/server/getType");
const sanitize = require("sanitize-filename");

async function getFiles(req, res) {
  var type = await getType(req.params.server);
  console.log("HIT");
  if (type == "N-VPS") {
    //To be changed
  }
  if (type == "docker") {
    console.log("HIT 2");
    const DockerClient = new (require("dockerode"))();
    const fs = require("fs");
    var container = DockerClient.getContainer(req.params.server);
    container.inspect(function (err, container_data) {
      if (err) {
        res.send(err.message);
      } else {
        var basepath = container_data.Mounts[0].Source;
        var path;
        req.query.path
          ? (path = basepath + sanitize(req.query.path))
          : (path = basepath);
        console.log(path);
        //console.log(fs.lstatSync(basepath).isDirectory())
        fs.lstat(path, (err, stats) => {
          if (err) {
            res.send(err.message);
          } else {
            console.log(stats.isDirectory());
            try {
              if (stats.isDirectory()) {
                fs.readdir(path, function (err, files) {
                  var file_list = [];
                  function sendData() {
                    if (file_list.length == files.length) {
                      res.send(file_list);
                    }
                  }
                  files.forEach(function (file) {
                    fs.lstat(path + file, (err, stats) => {
                      let type;
                      stats.isDirectory() ? (type = "folder") : (type = "file");
                      file_list.push({ file: file, type: type });
                      sendData();
                    });
                  });
                });
              } else {
                var readStream = fs.createReadStream(path, "utf8");
                let data = "";
                readStream
                  .on("data", function (chunk) {
                    data += chunk;
                  })
                  .on("end", function () {
                    res.send(data);
                  });
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
    //To be changed
  }
}

module.exports = { getFiles };
