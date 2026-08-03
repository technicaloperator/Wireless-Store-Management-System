import express from "express";
import statusRoutes from "./statusRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";

const router = express.Router();

router.use("/status", statusRoutes);
router.use("/inventory", inventoryRoutes);

export default router;
