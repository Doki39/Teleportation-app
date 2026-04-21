import "./load-env.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool } from "./data/dbconnection.js";
import { initGoogleCredentials } from "./services/googleAuthService.js";
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

function normalizeCorsOrigin(entry) {
  const s = entry.trim().replace(/\/$/, "");
  if (!s || s === "*") return s || "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function collectCorsOrigins() {
  const out = [];
  const pushList = (raw) => {
    if (!raw?.trim()) return;
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => out.push(normalizeCorsOrigin(s)));
  };
  pushList(process.env.CORS_ORIGIN);
  const front = process.env.FRONTEND_URL?.trim();
  if (front) out.push(normalizeCorsOrigin(front));
  return out.filter(Boolean);
}

function corsOriginFromEnv() {
  const parts = collectCorsOrigins();
  if (parts.length === 0) return true;
  if (parts.includes("*")) return true;
  const uniq = [...new Set(parts)];
  if (uniq.length === 1) return uniq[0];
  return (origin, callback) => {
    if (!origin) return callback(null, true);
    const norm = origin.replace(/\/$/, "");
    if (uniq.includes(norm)) return callback(null, true);
    callback(null, false);
  };
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

async function start() {
  try {
    await initGoogleCredentials();
  } catch (err) {
    console.error("[googleAuthService] Failed to load Google credentials from S3:", err.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
