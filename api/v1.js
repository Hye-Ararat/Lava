const router = require("express").Router({mergeParams: true});
const axios = require("axios");
// Server Routes
const server = require("./v1/server")

router.use("/servers/:server", server);
router.ws("/monitor", require("./v1/monitor"));



module.exports = router;
