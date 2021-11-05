const getType = require("./getType");
const convertID = require("../lxd/convertID")
/**
 * Fetches Server State Information
 */
function getState(id) {
    return new Promise((resolve, reject) => {
        switch (getType(id)) {
            case "n-vps" || "kvm":
                const axios = require("axios");
                const client = axios.create({
                    socketPath: "/var/snap/lxd/common/lxd/unix.socket"
                })
                try {
                var state = await client.get(`/1.0/instances/${convertID(id)}/state`)
                } catch {
                    return reject("Error while retrieving state")
                }
                return resolve(state.metadata.status);
                break;
            case "docker":
                const docker = require("dockerode");
                try {
                var container = await docker.getContainer(id);
                var {state} = await container.inspect();
                } catch {
                    return reject("Error while retrieving state");
                }
                return reolve(state);
                break;
            default:
                return reject("Invalid Server");
        }
    })
}

module.exports = getState;