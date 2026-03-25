import express from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { generatePicture } from "../models/nano-banana.js";
import { pool } from "../data/dbconnection.js";
import { uploadImage, uploadBufferToDrive } from "../services/uploadService.js";
import { pipeDriveFileToResponse } from "../services/driveMediaService.js";
import { requireAuth, requireAdmin, userIsAdmin } from "../middleware/authMiddleware.js";

const uploadToDrive = multer({ storage: multer.memoryStorage() });
const router = express.Router();

const PHOTOS_UID_PROCESSED_URI_UNIQUE = "photos_uid_processed_uri_unique";

function isPhotosLibraryUniqueViolation(err) {
  if (err?.code !== "23505") return false;
  const c = String(err.constraint || "");
  return c === PHOTOS_UID_PROCESSED_URI_UNIQUE || c.includes("photos_uid_processed_uri");
}

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

function toAbsoluteImageUrl(imageUrl, req) {
  const s = String(imageUrl ?? "").trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  const origin =
    process.env.PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
    `${req.protocol}://${req.get("host")}`;
  const pathPart = s.startsWith("/") ? s : `/${s}`;
  return `${origin}${pathPart}`;
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const admin = await userIsAdmin(req.user.uid);
    const { rows } = admin
      ? await pool.query("SELECT * FROM photos ORDER BY created_at DESC")
      : await pool.query(
          "SELECT * FROM photos WHERE uid = $1 ORDER BY created_at DESC",
          [req.user.uid]
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


router.post("/upload", requireAuth, uploadToDrive.single("image"), async (req, res) => {
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

router.post(
  "/upload-local",
  requireAuth,
  requireAdmin,
  uploadToDrive.single("image"),
  async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ message: "No photo sent" });
      }
      const mime = req.file.mimetype || "";
      let ext = ".jpg";
      if (mime.includes("png")) ext = ".png";
      else if (mime.includes("webp")) ext = ".webp";
      else if (mime.includes("jpeg") || mime.includes("jpg")) ext = ".jpg";

      const filename = `${nanoid()}${ext}`;
      const imageUrl = await uploadBufferToDrive(req.file.buffer, {
        filename,
        mimeType: mime || "image/jpeg",
      });
      return res.json({ imageUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || "Drive upload failed" });
    }
  }
);

router.post(
  "/generate-preview",
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const { imageUrl, modifyText } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ message: "No imageUrl provided" });
      }
      if (!modifyText || !String(modifyText).trim()) {
        return res.status(400).json({ message: "No modifyText provided" });
      }

      const absoluteInput = toAbsoluteImageUrl(imageUrl, req);
      const base64 = await generatePicture(absoluteInput, String(modifyText).trim());
      const processedUri = await uploadBufferToDrive(Buffer.from(base64, "base64"), {
        filename: `preview-${nanoid()}.jpg`,
        mimeType: "image/jpeg",
      });
      return res.json({ processedUri });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || "Preview generation failed" });
    }
  }
);

router.post("/generate", requireAuth, async (req, res) => {
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

    const absoluteInput = toAbsoluteImageUrl(imageUrl, req);
    const base64 = await generatePicture(absoluteInput, modifyText);
    const processedBuffer = Buffer.from(base64, "base64");
    const processedUri = await uploadBufferToDrive(processedBuffer, {
      filename: `generated-${nanoid()}.jpg`,
      mimeType: "image/jpeg",
    });

    const unprocessedImageUri = imageUrl;

    const { rows: inserted } = await pool.query(
      "INSERT INTO photos (uid, unprocessed_image_uri, processed_uri) VALUES ($1, $2, $3) RETURNING *",
      [req.user.uid, unprocessedImageUri, processedUri]
    );

    return res.status(201).json(inserted[0]);
  } catch (err) {
    if (isPhotosLibraryUniqueViolation(err)) {
      return res.status(409).json({
        message: "This image is already in your library.",
        code: "PHOTOS_LIBRARY_DUPLICATE",
      });
    }
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
