const express = require('express')
const expressws = require('express-ws')
const router = express.Router()
const multer = require('multer')
expressws(router)

/**
 * Network Routes
 */
router.post("/network", require("./network/post"))
router.post("/network/:bridge/remotes", require("./network/remotes/post"));
router.get('/network/:bridge/forwards', require('./network/forwards/get'))
router.put("/network/:bridge/forwards/ports", require("./network/forwards/ports/put"));
router.get('/network/:bridge', require('./network/get'))
/**
 * Instance Routes
 */
router.get('/instances/:instance', require('./instance/get'))
router.post('/instances', require('./instance/post'))
router.ws('/instances/:instance/console', require('./instance/console/ws'))
router.ws('/instances/:instance/monitor', require("./instance/monitor/ws"))
router.delete("/instances/:instance", require("./instance/delete"))
router.get('/instances/:instance/monitor', require("./instance/monitor/get"))
router.post('/instances/:instance/state', require('./instance/state/post'))
router.get('/instances/:instance/state', require('./instance/state/get'))
router.ws('/instances/:instance/control', require('./instance/control/ws'))
router.get('/instances/:instance/console', require('./instance/console/get'))
router.ws('/instances/:instance/console/vga', require('./instance/console/vga/ws'))
router.get('/instances/:instance/files', require('./instance/files/get'))
router.get('/instances/:instance/files/type', require('./instance/files/type/get'))
router.post('/instances/:instance/files', require('./instance/files/post'))
router.patch('/instances/:instance/files', require('./instance/files/patch'))
router.post("/instances/:instance/backups", require("./instance/backups/post"))
router.get("/instances/:instance/backups/:backup", require("./instance/backups/get"))
router.delete("/instances/:instance/backups/:backup", require("./instance/backups/delete"));
router.get('/instances/:instance/snapshots', require('./instance/snapshots/get'))
router.post('/instances/:instance/snapshots', require('./instance/snapshots/post'))
router.post('/instances/:instance/snapshots/:uuid/restore', require('./instance/snapshots/restore/post'))
router.delete('/instances/:instance/snapshots/:uuid', require('./instance/snapshots/delete'))
router.get('/instances/:instance/network', require("./instance/network/get"));
router.delete('/instances/:instance/files', require('./instance/files/delete'))
/**
 * System Routes
 */
router.get('/system', require('./system/get'))
router.get('/system/operations', require('./system/operations/get'))
router.delete('/system/operations/:uuid', require('./system/operations/delete'))
router.get('/system/warnings', require('./system/warnings/get'))
router.delete('/system/warnings/:uuid', require('./system/warnings/delete'))
/**
 * Storage Routes
 */
router.get('/storage', require('./storage/get'))
router.get('/storage/:uuid/stats', require('./storage/stats/get'))

module.exports = router