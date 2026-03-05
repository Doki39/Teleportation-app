import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { generatePicture } from "../models/nano-banana.js";
import { pool } from "../data/dbconnection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const UNPROCESSED_DIR = path.join(UPLOADS_DIR, "unprocessed");
const PROCESSED_DIR = path.join(UPLOADS_DIR, "processed");

const unprocessedStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UNPROCESSED_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (file.mimetype && file.mimetype.split("/")[1]) || "jpg";
    cb(null, `${nanoid()}.${ext}`);
  },
});

const uploadUnprocessed = multer({ storage: unprocessedStorage });
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

router.post("/generate", uploadUnprocessed.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo sent" });
    }

    const imageBuffer = await fs.readFile(req.file.path);
    const base64 = await generatePicture(imageBuffer);

    const processedFilename = `${nanoid()}.jpg`;
    const processedPath = path.join(PROCESSED_DIR, processedFilename);

    const processedBuffer = Buffer.from(base64, "base64");
    await fs.writeFile(processedPath, processedBuffer);

    const unprocessedImageUri = "/uploads/unprocessed/" + req.file.filename;
    const processedUri = "/uploads/processed/" + processedFilename;

    await pool.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        unprocessed_image_uri TEXT NOT NULL,
        processed_uri TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const { rows } = await pool.query(
      "INSERT INTO photos (unprocessed_image_uri, processed_uri) VALUES ($1, $2) RETURNING *",
      [unprocessedImageUri, processedUri]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (_) {}
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
