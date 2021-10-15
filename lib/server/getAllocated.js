const Dockerode = require('dockerode')
const Lxd = require('@wolfogaming/node-lxd')
const Client = Lxd(null, {})
const docker = new Dockerode()
module.exports = async function getAllocated() {
    var memallocated = 0
    var cpuallocated = 0
    var diskallocated = 0
    var instances = 0
    const docker_containers = await docker.listContainers()
    var s = await docker.listConfigs()
    s[0].Spec.Data.
    docker_containers.forEach(container => {
        container.HostConfig.
    })
}