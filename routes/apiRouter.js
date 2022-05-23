import express from "express";
import v1router from "./v1/v1router.js";

const router = express.Router();

router.use("/v1", v1router);
router.get("/", (req, res) => {
    res.send("Hye Lava API v1");
})

export default router;