/* eslint-disable no-unused-vars */
const { getType } = require("../../../../lib/server/getType");
const util = require("minecraft-server-util");
const axios = require("axios");
const properties = require("properties-parser");

async function wsMinecraftPlayers(ws, req) {  
  axios.get(`https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/servers/${req.params.uuid}`, {
    headers: {
      Authorization: `Bearer ${process.env.DAEMON_KEY}`,
    }
  }).then((response) => {
    axios.get(`https://us-central1-hye-ararat.cloudfunctions.net/api/v1/${process.env.INSTANCE_ID}/admin/nodes/${process.env.NODE_ID}/allocations/${response.data.allocations.main}`, {
      headers: {
        Authorization: `Bearer ${process.env.DAEMON_KEY}`,
      }
    }).then(async function (allocation_data) {
      const DockerClient = new (require("dockerode"))();
      const fs = require("fs");
      var container = DockerClient.getContainer(req.params.uuid);
      var container_data = await container.inspect();
      var basepath = container_data.Mounts[0].Source;
      properties.read(`${basepath}/server.properties`, function(err, properties_data){
        var data;
        var runtime = setInterval(async () => {
          util.status(allocation_data.data.ip_address, { port: allocation_data.data.port }).then((response) => {
            console.log(response);
            var info = {
              maxPlayers: properties_data["max-players"],
              onlinePlayers: response.onlinePlayers,
              player_list: response.samplePlayers,
            };
            if (data == JSON.stringify(info)) {
              console.log("Same don't bother");
            } else {
              data = JSON.stringify(info);
              ws.send(data);
            }
          }).catch((error) => {
            var info = {
              maxPlayers: properties_data["max-players"],
              onlinePlayers: 0,
              player_list: null,
            }
            ws.send(JSON.stringify(info))
          })
        }, 1000);
        ws.on("close", () => {
          clearInterval(runtime);
        });
      })
      })
  })
}

module.exports = { wsMinecraftPlayers };
