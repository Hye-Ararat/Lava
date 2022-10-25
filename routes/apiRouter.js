import axios from "axios";
import express from "express";
import v1router from "./v1/v1router.js";

const router = express.Router();
router.use("*", async (req, res, next) => {
    if (!req.headers.authorization && !req.query.authorization) return res.status(401).send("Unauthorized");
    if (!req.headers.authorization && req.query.authorization) req.headers.authorization = "Bearer " + req.query.authorization;
    let allowed;
    try {
        allowed = await axios.get(process.env.PANEL_URL + "/api/v1/validKey", {
            headers: {
                Authorization: req.headers.authorization
            }
        });
    } catch (error) {
        allowed = false;
    }
    if (!allowed) return res.status(401).send("Unauthorized");
    return next()
});
router.use("/v1", v1router);
router.get("/", (req, res) => {
    res.send("Hye Lava API v1");
})

export default router;