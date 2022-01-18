// imports
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const setup = require('./tools/setup')
var args = yargs(hideBin(process.argv)).argv
if (args._[0] == "setup") {
    console.log("setup")
    setup(args)
} else {
    process.on("unhandledRejection", (rejection) => {
        if (rejection && rejection.stack) console.error(rejection + ' ' + rejection.stack)
        else console.error(rejection)

    })
    const express = require('express')
    const https = require('https')
    const fs = require('fs')
    var colors = require('colors')
    const expressws = require('express-ws')
    const nodexd = require('node-xd')
    require('./lib/logger')
    const dotenv = require('dotenv').config()
    const Ararat = require('ararat')
    // Create client and express app
    const app = express()
    app.set("view engine", "ejs");
    app.use(express.static(__dirname + '/public'));
    app.use(express.json())
    app.use(express.text())
    app.use(require('cors')())
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
    if (process.env.LXD_URL.startsWith('unix:')) {
        var client = new nodexd(process.env.LXD_URL, {
        });
    } else {
        var client = new nodexd(process.env.LXD_URL, {
            cert: fs.readFileSync(process.env.LXD_TRUST_CERT),
            key: process.env.LXD_TRUST_KEY
        });
    }

    if (!process.env.PANEL_URL) return console.error('No panel URL spcified')
    var ararat = new Ararat(process.env.PANEL_URL, process.env.API_KEY, "admin")
    var DBClient = require('hyedb')
    module.exports = {
        lxd: {
            cert: __dirname + process.env.LXD_TRUST_CERT,
            key: __dirname + process.env.LXD_TRUST_KEY,
            unix: process.env.LXD_URL.startsWith('unix:'),
            url: process.env.LXD_URL
        }
        , client, ararat, db: new DBClient(__dirname + '/storage'), ws: {
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
        app.use(async (req, res, next) => {
            console.info("Got request", { method: req.path.includes('.websocket') ? "WS" : req.method, path: req.path })
            if (req.method == "GET" && req.path.includes("/console") && !req.path.includes(".websocket")) {
                console.log("Get spice")
                console.log(req.path.split("/")[4])
                var Instance = await ararat.instance(req.path.split("/")[4], ["magma_cube"])
                if (await Instance.console().verify(req.query.auth)) {
                    next()
                } else {
                    console.log("Unauthorized")
                }
            } else
                if (req.path.includes('.websocket')) {
                    next()
                } else {
                    var key = process.env.API_KEY;
                    console.log(req.headers)
                    if (!req.headers.authorization) {
                        console.log('Unauthorized')
                        return res.status(403).send("Unauthorized")
                    }
                    if (key === req.headers.authorization.split(" ")[1]) {
                        console.log("Authorized")
                        next()
                    } else {
                        console.log('Unauthorized')
                        return res.status(403).send("Unauthorized")
                    }
                }

        })
    }
    var api = require('./api')
    app.use("/api/v1", api)
    app.all("*", (req, res) => {
        res.status(404).send("404 Not Found")
    })
    if (process.env.SSL_CERT && process.env.SSL_KEY) {
        var httpsListener = httpsapp.listen(3434, () => {

            console.info("HTTPS server listening", { port: httpsListener.address().port })
        })

    }
    var httpListener = app.listen(3535, () => {
        console.info("HTTP server listening", { port: httpListener.address().port })
    })
}
