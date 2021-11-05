function getType(id) {
	return new Promise(async (resolve, reject) => {
		const docker = new (require("dockerode"))();
		try {
			var container = await docker.getContainer(id);
            var inspect = await container.inspect()
		} catch {
            const axios = require("axios").default;
            var client = axios.create({
                socketPath: "/var/snap/lxd/common/lxd/unix.socket",
            });
            const convertID = require("../../lib/lxd/convertID");
            try {
                var lxd_data = await client.get(`/1.0/instances/${convertID(id)}`);
            } catch {
                return reject("unknown")
            }
            switch(lxd_data.data.metadata.type) {
                case "container":
                    return resolve("n-vps")
                    break;
                case "virtual-machine":
                    return resolve("kvm")
                    break;
        };        
    }
    return resolve("docker")
})
}

module.exports = getType;