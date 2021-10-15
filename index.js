const Dotenv = require("dotenv");
const yargs = require("yargs").argv;
if (yargs.env == typeof String) {
  Dotenv.config({ path: yargs.env.env });
} else {
  Dotenv.config();
}

const Colors = require("colors");
const Table = require("cli-table");
const Dockerode = require("dockerode");
const Lxd = require("@wolfogaming/node-lxd");
const express = require("express");
const Fs = require("fs");
const fs = require("fs");
const Os = require("os");
const Nou = require("node-os-utils");
const PrettyBytes = require("pretty-bytes");
const Ora = require("ora");
const Prompts = require("prompts");
const router = express.Router();
const install = require("./install");
const https = require("https");
const readline = require("readline");
const cors = require("cors");
const { isCurrentUserRoot, setLogger } = require("./lib/util");
const app = express();
app.use(cors());
var expressWs = require("express-ws")(app);

const api_v1 = require("./api/v1/v1.js");
if (process.env.DEBUG == "true") {
  console.info("Debug mode is enabled!");
}
const Collecting = Ora("Collecting system information").start();

setLogger();
if (!isCurrentUserRoot()) {
  Collecting.fail("Hye Lava must be run as root!");
  process.exit(1);
} else if (!Fs.existsSync("/var/snap/lxd/common/lxd/unix.socket")) {
  Collecting.fail(
    `${
      process.env.DEBUG == "true"
        ? "LXD socket is missing or not installed. "
        : ""
    } Please run the install script found in the admin panel.`
  );
  process.exit(1);
} else if (!Fs.existsSync("./.env")) {
  Collecting.fail("Hye Lava has not been setup. Starting setup process.");
  install();
} else {
  const Client = Lxd(null, {});
  const docker = new Dockerode();

  module.exports = {
    lxd: Client,
    docker: docker,
  };
  Client.info(async function (err, info) {
    if (!err) {
      if (process.env.DEBUG == "true") {
        var versionTable = new Table();
        var dinfo = await (await docker.info()).ServerVersion;
        versionTable.push(
          ["Hostname".cyan.bold, info.environment.server_name],
          ["LXC".cyan.bold, info.environment.server_version],
          ["Docker".cyan.bold, dinfo],
          [
            info.environment.storage.cyan.bold,
            info.environment.storage_version,
          ],
          [
            "OS".cyan.bold,
            info.environment.os_name + " " + info.environment.os_version,
          ],
          ["Hye Lava".cyan.bold, process.env.VERSION],
          ["Panel URL".cyan.bold, process.env.PANEL_DOMAIN]
        );
        Collecting.succeed("Collected and verified system compatibility");
        console.raw(versionTable.toString());
      }
      require("./lib/getStats").execute();
      app.use(router);
      router.use(express.json());
      router.use(express.text());
      app.use(express.text());
      app.use(express.json());

      router.use("/api/v1", api_v1);
      router.get("/", (req, res) => {
        res.send("Lava Daemon");
      });
      app.ws("/test", (ws, req) => {
        ws.send("hi");
        ws.on("open", () => {
          ws.send("hi");
        });
      });
      const Starting = Ora("Starting Hye Lava").start();
      try {
        var httpsServer = https.createServer(
          {
            key: fs.readFileSync(process.env.SSL_KEY),
            cert: fs.readFileSync(process.env.SSL_CERT),
          },
          app
        );
      } catch (err) {
        Starting.fail("An error occured while initilizing SSL.");
        if (process.env.DEBUG == "true") {
          console.error(err.message);
        }
        process.exit(1);
      }
      app.listen(2222);

      var server = httpsServer
        .listen(process.env.PORT, function () {
          Starting.succeed(
            `Hye Lava successfully started on port ${process.env.PORT}`
          );
          const express_ws = require("express-ws")(app, server);
          if (process.env.DEBUG == "true") {
            console.info(
              `Listening on https://${process.env.DAEMON_DOMAIN}:${
                server.address().port
              }/`
            );
          }
        })
        .on("error", function (error) {
          Starting.fail(
            `Hye Lava failed to listen on port ${process.env.PORT}`
          );
          if (process.env.DEBUG == "true") {
            console.error(error.message);
          }
          process.exit(1);
        });
    } else {
      Collecting.error("Failed to collect system information");
      if (process.env.DEBUG == "true") {
        console.error(err.message);
      }
      process.exit(1);
    }
  });
}
