import "./load-env.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool } from "./data/dbconnection.js";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import photosSlidesRoutes from "./routes/photosSlides.js";
import promptRoutes from "./routes/prompt.js";
import adminRoutes from "./routes/admin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "processed"), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "unprocessed"), { recursive: true });

const PORT = process.env.PORT || 10000;
const app = express();

function corsOriginFromEnv() {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === "*") return true;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return true;
  return parts.length === 1 ? parts[0] : parts;
}

app.use(
  cors({
    origin: corsOriginFromEnv(),
  })
);
app.use(express.json());

app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/", (_req, res) => res.send("Server is live!"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/photos", photosSlidesRoutes);

let heavyPhotosRouterPromise = null;
function getHeavyPhotosRouter() {
  if (!heavyPhotosRouterPromise) {
    heavyPhotosRouterPromise = import("./routes/photos.js").then((m) => m.default);
  }
  return heavyPhotosRouterPromise;
}

app.use("/api/photos", (req, res, next) => {
  getHeavyPhotosRouter()
    .then((router) => router(req, res, next))
    .catch(next);
});

app.use("/api/prompts", promptRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/db-health", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, rows });
  } catch (err) {
    console.error("DB health check failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
