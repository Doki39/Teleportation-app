import express from "express";
import { pool } from "../data/dbconnection.js";
import { pipeDriveFileToResponse } from "../services/driveMediaService.js";

const router = express.Router();

router.get("/drive-media/:fileId", async (req, res) => {
  try {
    const raw = req.params.fileId;
    const fileId = decodeURIComponent(String(raw ?? "").trim());
    if (!fileId || fileId.includes("..") || fileId.includes("/") || fileId.length > 128) {
      return res.status(400).json({ message: "Invalid Drive file id" });
    }
    await pipeDriveFileToResponse(fileId, res);
  } catch (err) {
    console.error("drive-media:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: err.message || "Failed to load image" });
    }
  }
});

router.get("/slides", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM photo_rotation");
    return res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch slide photos" });
  }
});

export default router;
