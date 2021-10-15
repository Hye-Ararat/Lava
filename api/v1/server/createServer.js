const axios = require("axios");
const Lxd = require("@wolfogaming/node-lxd");

async function getImage(os, release, callback) {
  var result;
  if (os.arch() == "arm" || os.arch() == "arm64") {
    result = await axios.get(
      `https://us.images.linuxcontainers.org/1.0/images/aliases/${os}/${release}/arm64`
    );
  } else if (os.arch() == "x64") {
    result = await axios.get(
      `https://us.images.linuxcontainers.org/1.0/images/aliases/${os}/${release}/amd64`
    );
  } else {
    result = await axios.get(
      `https://us.images.linuxcontainers.org/1.0/images/aliases/${os}/${release}/amd64`
    );
  }
  callback(result.data.metadata.target);
}
const Dockerode = require("dockerode");
function createServer(req, res) {
  console.log("hit");
  if (!req.body && !res.headersSent)
    return res
      .status(400)
      .json({ status: "error", data: "Body is not present" });
  if (!req.body.type && !res.headersSent)
    return res
      .status(400)
      .json({ status: "error", data: "Type is not defined" });
  if (!req.body.id && !res.headersSent)
    return res.status(400).json({ status: "error", data: "ID is not defined" });
  if (req.body.type == "N-VPS") {
    const Client = Lxd(null, {});
    if (!req.body.os && !res.headersSent)
      return res
        .status(400)
        .json({ status: "error", data: "Operating system is not defined" });
    if (!req.body.release && !res.headersSent)
      return res
        .status(400)
        .json({ status: "error", data: "OS release (version) is not defined" });
    getImage(req.body.os, req.body.release, function (fingerprint) {
      res
        .status(202)
        .json({ status: "success", data: "The installation has started." });
      Client.launch(
        req.body.id,
        {
          type: "image",
          mode: "pull",
          protocl: "simplestreams",
          server: "https://us.images.linuxcontainers.org/",
          alias: fingerprint,
        },
        {},
        "",
        function (err) {
          if (err) {
            console.err(err._message);
            //Mark install as failed in panel using err._message once feature has been implemented with code 500
          } else {
            console.log("success");
            //Mark install as successful in panel once implemented.
          }
        }
      );
    });
  }

  if (req.body.type == "docker") {
    //I can make this work
    axios
      .get(
        `https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/magma_cubes/${req.body.magma_cube}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.DAEMON_KEY}`,
          },
        }
      )
      .then(function (response) {
        var magma_cube = response.data;
        console.log(magma_cube);
        axios
          .get(
            `https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/nodes/${process.env.NODE_ID}/allocations/${req.body.allocation}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.DAEMON_KEY}`,
              }
            }
          )
          .then(function (allocation_response) {
            const allocation = allocation_response.data;
            console.log(allocation);
            if (allocation_response.data.type == "docker") {
              const docker = new Dockerode();
              var cpu = 200;
              res.status(202).json({
                status: "success",
                data: "The installation has started.",
              });
              docker.pull(magma_cube.images[req.body.image_group][req.body.image_index].image, function(err, pullStream){
                if (err){
                  console.log(err)
                }
                docker.modem.followProgress(pullStream, onFinished, onProgress);
                function onFinished(err, output){
                  docker.createContainer(
                    {
                      Image: "hello:latest",
                      name: req.body.id,
                      User: `${magma_cube.images[req.body.image_group][req.body.image_index].user}`,
                      OpenStdin: true,
                      AttachStdin: true,
                      AttachStdout: true,
                      AttachStderr: true,
                      Volumes: {
                        [magma_cube.mount ? `${magma_cube.mount}` : "/"]: {},
                      },
                      Tty: true,
                      Env: [`SERVER_CONFIG_MEMORY=${req.body.limits.memory}`, `SERVER_CONFIG_DISK=${req.body.limits.disk}`, `SERVER_CONFIG_CPU=${req.body.limits.cpu}`, `SERVER_CONFIG_MOUNT=${magma_cube.mount}`].concat(req.body.env),
                      ExposedPorts: {
                        [`${allocation.port}/tcp`]: {},
                        [`${allocation.port}/udp`]: {},
                      }, // ports array
                      HostConfig: {
                        PortBindings: {
                          [`${allocation.port}/tcp`]: [
                            {
                              HostIp: "0.0.0.0",
                              HostPort: `${allocation.port}`,
                            },
                          ],
                          [`${allocation.port}/udp`]: [
                            {
                              HostIp: "0.0.0.0",
                              HostPort: `${allocation.port}`,
                            },
                          ],
                        },
                        Memory: Math.round(req.body.limits.memory * 1000000),
                        MemoryReservation: Math.round(req.body.limits.memory * 1000000),
                        MemorySwap: -1,
                        CpuQuota: req.body.limits.cpu > 0 ? req.body.limits.cpu * 100000 : -1,
                        CpuPeriod: 100000,
                        CpuShares: 1024,
                        BlkioWeight: 500,
                        Dns: ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"],
                        SecurityOpt: ["no-new-privileges"],
                        DiskQuota: Math.round(req.body.limits.disk * 1000000),
                        CapDrop: [
                          "setpcap",
                          "mknod",
                          "audit_write",
                          "net_raw",
                          "dac_override",
                          "fowner",
                          "fsetid",
                          "net_bind_service",
                          "sys_chroot",
                          "setfcap",
                        ],
                        OomKillDisable: false,
                        LogConfig: {
                          Type: "json-file",
                          Config: {
                            "max-size": "5m",
                            "max-file": "1",
                          },
                        },
                      },
                    },
                    function (err, container) {
                      if (err) {
                        console.error(err);
                        //Mark install as failed on panel
                      } else {
                        container.inspect(function (err, container_data) {
                          var basepath = container_data.Mounts[0].Source;
                          var file_config = [
                            {
                              file_name: "server.properties",
                              parser: "properties",
                              options: [
                                { key: "server-ip", value: "0.0.0.0" },
                                { key: "server-port", value: `${allocation.port}` },
                              ],
                            },
                          ];
                          file_config.forEach(function (file) {
                            console.log(file);
                            if (file.parser == "properties") {
                              const properties = require("properties-parser");
                              file.options.forEach(function (option) {
                                console.log(option.value);
                                properties.createEditor(
                                  `${basepath}/${file.file_name}`,
                                  function (error, editor) {
                                    editor.set(option.key, option.value);
                                    editor.save(`${basepath}/${file.file_name}`);
                                  }
                                );
                              });
                            }
                          });
                          //Mark container as installed on panel.
                          axios
                            .put(
                              `https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/servers/${req.body.id}/install`,
                              {
                                installing: false,
                              },
                            )
                            .then(function () {
                              console.log("marked as installed");
                            })
                            .catch(function (error) {
                              console.log(
                                "error while marking server as installed"
                              );
                              console.log(error);
                            });
                          //Maybe remove??
                          container.start(function (err_start) {
                            if (err_start) {
                              //res.status(500).json({ status: 'error', data: err_start.message })
                              //mark install failed
                            } else {
                              container
                                .attach({
                                  stream: true,
                                  stdin: true,
                                  stdout: true,
                                  stderr: true,
                                })
                                .then((stream) => {
                                  //res.status(201).json({ status: 'success', data: container_data })
                                  stream.setEncoding("utf8");
                                  var state = "starting";
                                  var start_triggers = [
                                    ["Done (", "! For help, type"],
                                  ];
                                  stream.on("data", (data) => {
                                    data.split("\n").forEach((element) => {
                                      if (!element == "") console.log(element);
                                      if (state != "running") {
                                        start_triggers.forEach(function (
                                          trigger_set
                                        ) {
                                          var started = trigger_set.every(function (
                                            trigger
                                          ) {
                                            return element.includes(trigger);
                                          });
                                          if (started == true) {
                                            state = "running";
                                            console.log(
                                              "THE SERVER HAS BEEN MARKED AS RUNNING!"
                                            );
                                          }
                                        });
                                      }
                                    });
                                  });
                                });
                            }
                          });
                        });
                      }
                    }
                  );
                }
                function onProgress(event){
                  console.log(event)
                }
              })
            } else {
              res.send("Invalid Allocation");
            }
          })
          .catch(function (error) {
            console.log(error);
            res.send(error);
          });
      })
      .catch(function (error) {
        console.log(error);
        res.send(error);
      });
  }

  if (req.body.type == "KVM") {
    //Let's use LXD
    const axios = require("axios");
    res
      .status(202)
      .json({ status: "success", data: "The installation has started." });
    var client = axios.create({
      socketPath: "/var/snap/lxd/common/lxd/unix.socket",
    });
    var architecture = "x86_64";
    var devices = {
      iso: {
        "boot.priority": "10",
        source: "/root/Downloads/hye_win10_21H1.iso",
        type: "disk",
      },
      root: {
        path: "/",
        pool: "default",
        type: "disk",
        size: "30GiB",
      },
    };
    var machine_config = {
      architecture: architecture,
      name: `${req.body.id}`,
      type: "virtual-machine",
      source: {
        type: "none",
      },
      devices: devices,
    };
    console.log(machine_config);
    client
      .post("/1.0/instances", machine_config)
      .then(function (response) {
        console.log(response.data);
        //Mark as installed on panel
      })
      .catch(function (error) {
        console.log(error);
        //Mark as install failed on panel
      });
  }
}
module.exports = { createServer };
