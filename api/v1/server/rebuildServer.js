const axios = require("axios");
const DockerClient = new (require("dockerode"))();
const {getType} = require("../../../lib/server/getType");

async function rebuildServer(req, res){
  const type = await getType(req.body.id);
  if (type == "docker"){
    var container = DockerClient.getContainer(req.body.id);
    container.inspect(async function(err, container_data) {
      if (err) {
        res.send(err.message)
      } else {
        var basepath = container_data.Mounts[0].Source;
        console.log(container_data)
        if (container_data.State.Status == "running") await container.stop()
          container.remove().then(() => {
            axios.get(`https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/servers/${req.body.id}`, {
              headers :{
                Authorization: `Bearer ${process.env.DAEMON_KEY}`,
              }
            }).then((server_data) => {
              axios.get(`https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/magma_cubes/${server_data.data.magma_cube.cube}`, {
                headers: {
                  Authorization: `Bearer ${process.env.DAEMON_KEY}`,
                }}).then(async function(magma_cube) {
                  var allocation_data = [];
                  var allocation_json = {}
                  var ports_json = {}
                  function getAllocationData(callback){server_data.data.allocations.list.forEach((allocation) => {
                    axios.get(`https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/nodes/${process.env.NODE_ID}/allocations/${allocation}`, {
                      headers: {
                        Authorization: `Bearer ${process.env.DAEMON_KEY}`,
                      }
                    }).then((allocation_info) => {
                      var formatted = {
                        [`${allocation_info.data.port}/tcp`]: {
                          HostIp: `${allocation_info.data.ip_address}`,
                          HostPort: `${allocation_info.data.port}`
                        },
                        [`${allocation_info.data.port}/udp`]: {
                          HostIp: `${allocation_info.data.ip_address}`,
                          HostPort: `${allocation_info.data.port}`
                        }
                      }
                      allocation_json[`${allocation_info.data.port}/tcp`] = [{
                        HostIp: `${allocation_info.data.ip_address}`,
                        HostPort: `${allocation_info.data.port}`
                      }
                      ]
                      ports_json[`${allocation_info.data.port}/tcp`] = {}
                      ports_json[`${allocation_info.data.port}/udp`] = {}
                      allocation_json[`${allocation_info.data.port}/udp`] = [{
                        HostIp: `${allocation_info.data.ip_address}`,
                        HostPort: `${allocation_info.data.port}`
                      }]
                      allocation_data.push(formatted);
                      if (allocation_data.length == server_data.data.allocations.list.length) callback(true);
                    })

                  })}
                  getAllocationData(function(response){
                    console.log(allocation_data)
                    console.log(allocation_json)
                    console.log(server_data.data)
                  DockerClient.pull(magma_cube.data.images[server_data.data.magma_cube.image_group][server_data.data.magma_cube.image_index].image, function(err, stream){
                    if (err) {
                      console.log(err)
                    }
                    DockerClient.modem.followProgress(stream, onFinished, onProgress);
                    function onFinished(err, output){
                      DockerClient.createContainer(
                        {
                          Image: "ghcr.io/hye-organization/minecraft/paper:1.17.1",
                          name: req.body.id,
                          User: `${magma_cube.data.images[server_data.data.magma_cube.image_group][server_data.data.magma_cube.image_index].user}`,
                          OpenStdin: true,
                          AttachStdin: true,
                          AttachStdout: true,
                          AttachStderr: true,
                          Tty: true,
                          Env: [`SERVER_CONFIG_MEMORY=${server_data.data.limits.memory}`, `SERVER_CONFIG_DISK=${server_data.data.limits.disk}`, `SERVER_CONFIG_CPU=${server_data.data.limits.cpu}`, `SERVER_CONFIG_MOUNT=${magma_cube.data.mount}`].concat(server_data.data.env),
                          ExposedPorts: ports_json,
                          HostConfig:{
                            Mounts: [{
                              "Type": "volume",
                              "Source": `${container_data.Mounts[0].Name}`,
                              "Target": `${container_data.Mounts[0].Destination}`,
                            }],
                            PortBindings: allocation_json,
                            Memory: Math.round(server_data.data.limits.memory * 1000000),
                            MemoryReservation: Math.round(server_data.data.limits.memory * 1000000),
                            MemorySwap: -1,
                            CpuQuota: server_data.data.limits.cpu > 0 ? server_data.data.limits.cpu * 100000 : -1,
                            CpuPeriod: 100000,
                            CpuShares: 1024,
                            BlkioWeight: 500,
                            Dns: ["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"],
                            SecurityOpt: ["no-new-privileges"],
                            DiskQuota: Math.round(server_data.data.limits.disk * 1000000),
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
                              }
                            }
                          },                        
  
                        }, function(err, newContainer) {
                          if (err){
                            console.log(err);
                            res.send(err);
                          } else {
                            res.send("Success")
                          }
                        }
                      )
                    }
                    function onProgress(event){
                      console.log(event)
                    }
                  })
                  })
              })
            })
          })
      }
    })
  } else {
    res.send("This endpoint is for docker only.")
  }
}

module.exports = {rebuildServer}