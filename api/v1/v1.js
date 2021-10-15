const express = require("express");
const router = express.Router();
const { system } = require("./system");
const server = require("./server/serverApi.js");
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./tmp");
    },
    filename: (req, file, cb) => {
      cb(null, req.params.server + "-" + file.originalname);
    },
  }),
});

//System Information
router.get("/system", system);

//Server
// Should change to /servers?
router.put("/server/:uuid/state", server.powerAction);
router.get("/server/:server/files", server.getFiles);
router.delete("/server/:server/files", server.deleteFiles);
router.get("/server/:server/files/download", server.downloadFiles);
router.post("/server/:server/files/upload", upload.any(), server.uploadFiles);
router.get("/server", server.listServer);
router.post("/server", server.createServer);
router.post("/server/rebuild", server.rebuildServer);
router.delete("/server/:uuid", server.deleteServer);
router.get("/server/:uuid", server.getServer);
router.ws("/server/:uuid/console", server.serverConsole);
router.post("/server/:uuid/files/write", server.writeFiles);
router.ws("/server/:uuid/resources", server.wsServerResources);
router.ws("/server/:uuid/minecraft/players", server.wsMinecraftPlayers);
module.exports = router;
