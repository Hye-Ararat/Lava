const express = require('express')
const expressws = require('express-ws')
const router = express.Router()
expressws(router)

// get instance
router.get('/instances/:instance', require('./instance/get'))
// get bridge forwards
router.get('/network/:bridge/forwards', require('./network/forwards/get'))
// get network bridge
router.get('/network/:bridge', require('./network/get'))
// create instance
router.post('/instances', require('./instance/post'))
// attach to instance console
router.ws('/instances/:instance/console', require('./instance/console/ws'))
// monitor instance resources
router.ws('/instances/:instance/monitor', require("./instance/monitor/ws"))
router.post('/instances/:instance/state', require('./instance/state/post'))
router.ws('/instances/:instance/control', require('./instance/control/ws'))
router.get('/instances/:instance/console', require('./instance/console/get'))
router.ws('/instances/:instance/console/vga', require('./instance/console/vga/ws'))
module.exports = router