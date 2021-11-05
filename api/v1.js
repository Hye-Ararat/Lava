const router = require("express").Router({ mergeParams: true });
const bcrypt = require("bcrypt");
const axios = require("axios");
router.use(async (req, res, next) => {
	if (req.path == "/api/v1/servers/:server/monitor") {
		if (!req.headers["monitor_token"])
			return res.status(401).send("No monitor token provided");
		if (!req.headers["monitor_token"].contains("Bearer"))
			return res.status(401).send("Unauthorized");
		if (!req.headers["monitor_token"].split(" ")[1])
			return res.status(401).send("Unauthorized");
		try {
			var valid = await axios.get(
				`${process.env.ARARAT_URL}/api/v1/admin/servers/${req.params.server}/monitor/verify`
			);
		} catch (error) {
			return res.status(401).send("Unauthorized");
		}
		if (valid.data.status != "success")
			return res.status(401).send("Unauthorized");
		return next();
	}
	if (!req.headers["authorization"])
		return res.status(403).json({ status: "error", data: "Unauthorized" });
	if (!req.headers["authorization"].contains("Bearer"))
		return res.status(403).json({ status: "error", data: "Unauthorized" });
	if (!req.headers["authorization"].split(" ")[1])
		return res.status(403).json({ status: "error", data: "Unauthorized" });
	let token = req.headers["authorization"].split(" ")[1];
	let match = bcrypt.compare(token, process.env.TOKEN);
	if (!match)
		return res.status(403).json({ status: "error", data: "Unauthorized" });
	return next();
});
// Server Routes
const server = require("./v1/server");

router.use("/servers/:server", server);
router.ws("/monitor", require("./v1/monitor"));

module.exports = router;
