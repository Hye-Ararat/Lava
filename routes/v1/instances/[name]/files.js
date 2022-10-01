import express from "express";
import http from "http";
import axios from "axios"

const router = express.Router({ mergeParams: true });


router.get("/", async (req, res) => {
    const { name } = req.params;
    const { path } = req.query;
    const authorization = req.headers.authorization;
    const options = {
        socketPath: './lava.sock',
    };
    let fileData;
    try {
        fileData = await axios.get(`/sftp?instance=${name}&path=${encodeURI(path)}`, options)
    } catch (e) {
        console.log(e.rawPacket);
    }
    Object.keys(fileData.headers).forEach(key => {
        res.setHeader(key, fileData.headers[key]);
    });
    if (fileData.data == "null") {
        return res.send([]);
    }
    if (fileData.data == "File Does Not Exist") {
        return res.status(400).send(fileData.data);
    }
    return res.send(fileData.data);
});

export default router;