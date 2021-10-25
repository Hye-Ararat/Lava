const { getType } = require("../../../lib/server/getType");
async function deleteServer(req, res) {
  const axios = require("axios");
  var type = await getType(req.params.uuid);
  console.log(type);
  if (type == "KVM" || type == "N-VPS") {
    var client = axios.create({
      socketPath: "/var/snap/lxd/common/lxd/unix.socket",
    });
    const deleteServer = (id, callback) => {
      client
        .delete(`/1.0/instances/${id}`)
        .then(function (response) {
          callback({
            status: "success",
            data: response.data,
          });
        })
        .catch(function (error) {
          callback({
            status: "error",
            data: error,
          });
        });
    };
    client
      .get(`/1.0/instances/${req.params.uuid}`)
      .then(function (response) {
        if (response.data.metadata.status == "Running") {
          client.put(`/1.0/instances/${req.params.uuid}/state`, {
            action: "stop",
            force: true,
          }).then(() => {
              client
                .get(`/1.0/instances/${req.params.uuid}`)
                .then(function (response) {
                  if (response.data.metadata.status == "Running") {
                    res.status(500).json({
                      status: "error",
                      data: "An error occured while stopping the instance",
                    });
                  } else {
                    deleteServer(`${req.params.uuid}`, function (response) {
                      if (response.status == "error") {
                        res
                          .status(500)
                          .json({ status: "error", data: response });
                      } else {
                        res.status(200).json({
                          status: "success",
                          data: "Instance was successfully deleted.",
                        });
                      }
                    });
                  }
                });
          }).catch(() => {
              res.status(500).json({
                status: "error",
                data: "An error occured while stopping the instance.",
              });
          })
        } else {
          deleteServer(`${req.params.uuid}`, function (response) {
            if (response.status == "error") {
              res.status(500).json({ status: "error", data: response });
            } else {
              res.status(200).json({
                status: "success",
                data: "Instance was successfully deleted.",
              });
            }
          });
        }
      })
      .catch(function (error) {
        res.send(error);
      });
  } else if (type == "docker") {
    const Dockerode = require("dockerode");
    const DockerClient = new Dockerode();
    let e;
    try {
      var container = DockerClient.getContainer(req.params.uuid);
    } catch (error) {
      e = error;
      return res
        .status(404)
        .json({ status: "error", data: "Container not found" });
    }
    if (!e) {
      container
        .remove()
        .then(() => {
          //Also have to delete volume
          res.status(200).json({
            status: "success",
            data: "Instance was successfully deleted.",
          });
        })
        .catch((reason) => {
          res.status(502).json({ status: "error", data: reason });
        });
    }
  } else if (type == "none") {
    res.status(404).json({ status: "error", data: "Server Does Not Exist" });
  } else {
    res
      .status(500)
      .json({ status: "error", data: "Server Does Not Have A Valid Type" });
  }
}
module.exports = { deleteServer };
