//Dependencies
const express = require("express");
const https = require("https");
const fs = require("fs");
const axios = require("axios");
const os = require("os");
const expressws = require("express-ws");
require("dotenv").config();
os.platform();
//Initialize Dependencies
const app = express();
const router = express.Router({mergeParams: true});
app.use(router);

//Axios Header Configuration
axios.interceptors.request.use((config) => {
	config.headers.Authorization = `Bearer ${process.env.API_KEY}`;
	return config;
});

//Server Function
function startApp() {
	//Route Files
	const v1 = require("./api/v1");

	//Routes
	router.use("/api/v1", v1);

	//Version Information
	app.get("/", (req, res) => {
		res.json({
			status: "success",
			data: "Hye Lava 0.0.1",
		});
	});
}

//Make Hye Lava Listen
try {
	var server = https
		.createServer({
			key: fs.readFileSync(process.env.SSL_KEY),
			cert: fs.readFileSync(process.env.SSL_CERT),
		})
		.listen(process.env.PORT, () => {
			console.log(`Hye Lava started at ${process.env.PORT}`);
			require("express-ws")(router, server);
			startApp();
		});
} catch (error) {
	console.log(error);
	console.log("Hye Lava Failed To Bind Port");
	process.exit(1);
}

