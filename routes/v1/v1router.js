import express from "express";
import instancesRouter from "./instances/instancesRouter.js";
import update from "./update.js";

const router = express.Router();

router.use("/instances", instancesRouter);
router.get("/update", update);

export default router;