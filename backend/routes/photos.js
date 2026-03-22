import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { generatePicture } from "../models/nano-banana.js";
import { pool } from "../data/dbconnection.js";
import { uploadImage } from "../services/uploadService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const PROCESSED_DIR = path.join(UPLOADS_DIR, "processed");

const uploadToDrive = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM photos ORDER BY created_at DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch photos" });
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


router.post("/upload", uploadToDrive.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo sent" });
    }
    const imageUrl = await uploadImage(req.file);
    return res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Upload to Drive failed" });
  }
});


router.post("/generate", async (req, res) => {
  try {
    const { imageUrl, promptId } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: "No imageUrl provided" });
    }
    if (promptId === undefined || promptId === null || promptId === "") {
      return res.status(400).json({ message: "No promptId provided" });
    }

    const { rows: promptRows } = await pool.query(
      "SELECT prompt FROM prompt_selection WHERE id = $1",
      [promptId]
    );
    const modifyText = promptRows[0]?.prompt;
    if (!modifyText || !String(modifyText).trim()) {
      return res.status(400).json({ message: "Prompt not found or Modify text is empty" });
    }

    const base64 = await generatePicture(imageUrl, modifyText);
    const processedFilename = `${nanoid()}.jpg`;
    const processedPath = path.join(PROCESSED_DIR, processedFilename);

    const processedBuffer = Buffer.from(base64, "base64");
    await fs.writeFile(processedPath, processedBuffer);

    const unprocessedImageUri = imageUrl;
    const processedUri = "/uploads/processed/" + processedFilename;

    const { rows: inserted } = await pool.query(
      "INSERT INTO photos (unprocessed_image_uri, processed_uri) VALUES ($1, $2) RETURNING *",
      [unprocessedImageUri, processedUri]
    );

    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
