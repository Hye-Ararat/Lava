import express from "express";
import http from "http";

const router = express.Router({ mergeParams: true });


router.get("/", (req, res) => {
    const { name } = req.params;
    const { path } = req.query;
    const authorization = req.headers.authorization;

    const options = {
        socketPath: './lava.sock',
        path: `/sftp?instance=${name}&path=${encodeURI(path)}`,
    };
    try {


        const clientRequest = http.request(options, response => {
            response.setEncoding("utf8");
            Object.keys(response.headers).forEach(key => {
                res.setHeader(key, response.headers[key]);
            });
            response.on("data", data => {
                if (data == "File Does Not Exist") {
                    return res.status(400).send(data);
                }
                if (!(data == "null")) {
                    res.write(data);
                } else {
                    return res.send([]);
                }
            })
            response.on("close", () => {
                res.end();
            })
            response.on("error", data => {
                console.log(data);
                res.status(500).send(data);
            });
        });
        clientRequest.end();
    } catch (e) {
        console.log(e);
    }
});

export default router;