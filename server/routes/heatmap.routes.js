
import express from "express";
import { getHeatmapData } from "../controllers/heatmap.controller.js";

const router = express.Router();

router.get("/", getHeatmapData);

export default router;
