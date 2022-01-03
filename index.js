// imports
process.on("unhandledRejection", (rejection) => {
    console.log('Omyghawwwdd')
    console.log(rejection)
})
const express = require('express')
const yargs = require('yargs/yargs')
const https = require('https')
const fs = require('fs')
var colors = require('colors')
const { hideBin } = require('yargs/helpers')
const expressws = require('express-ws')
const nodexd = require('node-xd')
const logger = require('./lib/logger')
const dotenv = require('dotenv').config()
const Ararat = require('ararat')
// Create client and express app
const app = express()
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.json())
if (process.env.SSL_CERT && process.env.SSL_KEY) {
    var httpsapp = https.createServer({
        cert: fs.readFileSync(process.env.SSL_CERT),
        key: fs.readFileSync(process.env.SSL_KEY)
    }, app)
    expressws(app, httpsapp)
    expressws(app)
} else {
    expressws(app)
}
const client = new nodexd("unix:///var/snap/lxd/common/lxd/unix.socket", {
});
if (!process.env.PANEL_URL) return console.error('No panel URL spcified')
var ararat = new Ararat(process.env.PANEL_URL, process.env.API_KEY, "admin")
var DBClient = require('hyedb')
module.exports = {
    client, ararat, db: new DBClient(__dirname + '/storage'), ws: {
        add: (name, ws) => {
            var self = module.exports
            self.ws.websockets.push({
                name: name,
                ws: ws
            })
            return self.ws.websockets.length
        },
        get: (name) => {
            var self = module.exports
            return self.ws.websockets.find(s => {
                return s.name == name
            })
        },
        set: (wsss) => {
            var self = module.exports
            self.ws.websockets = wsss
            return self.ws.websockets
        },
        websockets: []

    }
}
// read arguments
process.argv = yargs(hideBin(process.argv)).argv
// check for debugging
console.info("Starting Hye Lava")
if (process.argv.debug) {
    console.info('Debugging enabled')
    process.env.DEBUG = true;
    app.use((req, res, next) => {
        console.info("Got request", { method: req.path.includes('.websocket') ? "WS" : req.method, path: req.path })
        next()
    })
}
var api = require('./api')
app.use("/api/v1", api)
if (process.env.SSL_CERT && process.env.SSL_KEY) {
    var httpsListener = httpsapp.listen(3434, () => {

        console.info("HTTPS server listening", { port: httpsListener.address().port })
    })

}
var httpListener = app.listen(3535, () => {
    console.info("HTTP server listening", { port: httpListener.address().port })
})