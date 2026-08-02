import express from "express";
import statusRoutes from "./statusRoutes.js";

const router = express.Router();

router.use("/status", statusRoutes);

export default router;
