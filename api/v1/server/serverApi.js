const { getServer } = require("./getServer.js");
const { createServer } = require("./createServer");
const { listServer } = require("./listServer.js");
const { deleteServer } = require("./deleteServer.js");
const { powerAction } = require("./serverPowerActions.js");
const { wsServerResources } = require("./wsServerResources.js");
const { getFiles } = require("./files/getFiles.js");
const { downloadFiles } = require("./files/downloadFiles.js");
const { uploadFiles } = require("./files/uploadFiles");
const { wsMinecraftPlayers } = require("./minecraft/wsMinecraftPlayers");
const { writeFiles } = require("./files/writeFiles");
const { deleteFiles } = require("./files/deleteFiles");
const { rebuildServer } = require("./rebuildServer");
const { serverConsole } = require("./serverConsole");
module.exports = {
  getServer,
  createServer,
  listServer,
  deleteServer,
  powerAction,
  wsServerResources,
  getFiles,
  downloadFiles,
  uploadFiles,
  wsMinecraftPlayers,
  writeFiles,
  serverConsole,
  deleteFiles,
  rebuildServer,
};
