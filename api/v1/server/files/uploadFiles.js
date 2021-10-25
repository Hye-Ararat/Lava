const { getType } = require("../../../../lib/server/getType");
const { addAudit } = require("../../../../lib/server/addAudit");
const axios = require("axios");
const sanitize = require("sanitize-filename");
//const multer = require("multer");
async function uploadFiles(req, res) {
  console.log(req.params.server)
  var type = await getType(req.params.server);
  if (type == "N-VPS") {
    //To Be Added why did the queen go to the dentist yes this works horribly
  }
  if (type == "docker") {
    const DockerClient = new (require("dockerode"))();
    const fs = require("fs");
    var container = DockerClient.getContainer(req.params.server);
    container.inspect(function (err, container_data) {
      var server_name = container_data.Name.replace("/", "");
      if (err) {
        res.send(err.message);
      } else {
        var basepath = container_data.Mounts[0].Source;
        var path;
        req.query.path ? (path = basepath + sanitize(req.query.path)) : (path = basepath);
        console.log(path);
        fs.lstat(path, (err, stats) => {
          if (err) {
            console.log("OH NO!");
            res.send(err);
          } else {
            try {
              if (stats.isDirectory()) {
                console.log(req.files);
                console.log(req.files[0].originalname);
                var file_name = sanitize(req.files[0].originalname);
                console.log(file_name);
                fs.rename(
                  `./tmp/${server_name}-${file_name}`,
                  path + `${file_name}`,
                  function (err) {
                    if (err) {
                      res.send(err);
                    } else {
                      axios
                        .get(
                          `https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/servers/${server_name}`,
                          {
                            headers: {
                              Authorization: `Bearer ${process.env.DAEMON_KEY}`,
                            },
                          }
                        )
                        .then(function (response) {
                          console.log(response.data)
                          axios
                            .get(
                              `https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/magma_cubes/${response.data.magma_cube.cube}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${process.env.DAEMON_KEY}`,
                                },
                              }
                            )
                            .then(function (magma_cube) {
                              console.log(magma_cube.data.images[
                                response.data.magma_cube.image_group
                              ][response.data.magma_cube.image_index].user)
                              fs.chown(
                                path + `${file_name}`,
                                magma_cube.data.images[
                                  response.data.magma_cube.image_group
                                ][response.data.magma_cube.image_index].user,
                                magma_cube.data.images[
                                  response.data.magma_cube.image_group
                                ][response.data.magma_cube.image_index].user,
                                function (error) {
                                  if (error) {
                                    console.log(error);
                                    res.send(error);
                                  } else {
                                    addAudit(server_name, {
                                      type: "file",
                                      action: "upload",
                                      name: file_name,
                                      path: sanitize(req.query.path),
                                      user: "12345",
                                    });
                                    res.send("Success");
                                  }
                                }
                              );
                            })
                            .catch(function (error) {
                              console.log(error);
                              res.send(error);
                            });
                        })
                        .catch(function (error) {
                          console.log(error);
                          res.send("Error");
                        });
                    }
                  }
                );
              } else {
                console.log("THIS IS BROKEN");
                res.send(
                  "Cannot upload files to a file! Must upload to a directory."
                );
              }
            } catch (err) {
              console.log("SOMETHING HAS GONE WRONG!!!!!!");
              console.log(err);
              res.json({
                status: "error",
                data: err.message,
              });
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

module.exports = { uploadFiles };
