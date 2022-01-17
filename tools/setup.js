const axios = require('axios').default
var fs = require('fs')
var os = require('os');
const generateService = require('./generateservice')
module.exports = async (argv) => {
    if (!os.platform() == "linux") return console.log("Not running on linux")
    var s = fs.readFileSync('/etc/os-release').toString()
    if (!s.includes("Ubuntu")) return console.log("Not Running Ubuntu")
    if (!argv["api-key"]) return console.log("API Key not specified!");
    if (!argv["panel-url"]) return console.log("Panel URL not specified!");
    if (!argv["node"]) return console.log("Node ID not specified");
    var args = {
        node: argv["node"],
        panelurl: argv["panel-url"],
        apikey: argv["api-key"]
    }
    const { data, status } = await axios.get(args.panelurl + "api/v1/admin/nodes/" + args.node, {
        validateStatus: false,
        headers: {
            Authorization: "Bearer " + args.apikey
        }
    })
    if (status == 404) {
        console.log("Node not found on panel, set it up there before your run setup!")
        process.exit(1)
    } else if (status == 500 || status == 501 || status == 502) {
        console.log("Error while contacting panel")
        process.exit(1)
    } else if (status == 403) {
        console.log("API key invalid")
        process.exit(1)
    } else if (status == 200) {
        /**
         * @type {{env: string,data: {name: string,address:{hostname: string, ssl: boolean, port: number}, limits: {memory: number, cpu: number, disk: number}, id:string}}}
         */
        if (data.address.ssl == true) {
            var info = {
                data: data,
                env: `NODE_NAME=${args.node}
SSL_CERT=./cert/listen.crt
SSL_KEY=./cert/listen.key
PANEL_URL=${args.panelurl}
API_KEY=${args.apikey}
LXD_URL=unix:///var/snap/lxd/common/lxd/unix.socket
#LXD_TRUST_CERT=./lxd-webui.crt
#LXD_TRUST_KEY=./lxd-webui.key`
            }
            console.log("Be sure to put your certificate in the daemon folder as:\n Key: ./cert/listen.key\n Cert: ./cert/listen.cert")
        } else {
            var info = {
                data: data,
                env: `NODE_NAME=${args.node}
#SSL_CERT=./cert.crt
#SSL_KEY=./key.key
PANEL_URL=${args.panelurl}
API_KEY=${args.apikey}
LXD_URL=unix:///var/snap/lxd/common/lxd/unix.socket
#LXD_TRUST_CERT=./lxd-webui.crt
#LXD_TRUST_KEY=./lxd-webui.key`
            }
        }



        try {
            fs.writeFileSync("./.env", info.env.replace(" ", ""))
        } catch (error) {
            console.debug(error)
            console.log("Error while writing .env file")
        }
        generateService()


    }

}