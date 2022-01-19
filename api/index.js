const express = require('express')
const expressws = require('express-ws')
const router = express.Router()
const multer = require('multer')
expressws(router)

// get instance
router.get('/instances/:instance', require('./instance/get'))
// get bridge forwards
router.get('/network/:bridge/forwards', require('./network/forwards/get'))
router.put("/network/:bridge/forwards/ports", require("./network/forwards/ports/put"));
// get network bridge
router.get('/network/:bridge', require('./network/get'))
// create instance
router.post('/instances', require('./instance/post'))
router.post("/network", require("./network/post"))
// attach to instance console
router.ws('/instances/:instance/console', require('./instance/console/ws'))
// monitor instance resources
router.ws('/instances/:instance/monitor', require("./instance/monitor/ws"))
// delete instance
router.delete("/instance/:instance", require("./instance/delete"))
router.get('/instances/:instance/monitor', require("./instance/monitor/get"))
router.post('/instances/:instance/state', require('./instance/state/post'))
router.get('/instances/:instance/state', require('./instance/state/get'))
router.ws('/instances/:instance/control', require('./instance/control/ws'))
router.get('/instances/:instance/console', require('./instance/console/get'))
router.ws('/instances/:instance/console/vga', require('./instance/console/vga/ws'))
router.get('/instances/:instance/files', require('./instance/files/get'))
router.get('/instances/:instance/files/type', require('./instance/files/type/get'))
router.post('/instances/:instance/files', require('./instance/files/post'))
module.exports = router