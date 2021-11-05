const router = require("express").Router({ mergeParams: true });
router.ws("/monitor", require("./servers/monitor"))
module.exports = router;