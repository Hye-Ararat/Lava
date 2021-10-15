function getType(id) {
  return new Promise(async (resolve, reject) => {
    var type;
    const s = new (require("dockerode"))();
    var a = s.getContainer(id);
    a.inspect()
      .then((inf) => {
        resolve("docker");
      })
      .catch((err) => {
        const axios = require("axios").default;
        var client = axios.create({
          socketPath: "/var/snap/lxd/common/lxd/unix.socket",
        });
        client
          .get("/1.0/instances/" + id)
          .then((e) => {
            if (e.data.metadata.type == "container") {
              resolve("N-VPS");
            } else if (e.data.metadata.type == "virtual-machine") {
              resolve("KVM");
            }
          })
          .catch((err) => {
            resolve("none");
          });
      });
  });
}
getType("hello2asd7").then((e) => {
  console.log(e);
});
module.exports = { getType };
