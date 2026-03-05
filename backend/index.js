import "./load-env.js";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool } from "./data/dbconnection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "cars"), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_DIR, "keys"), { recursive: true });

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(UPLOADS_DIR));

import authRoutes from "./routes/auth.js";
import vehicleRoutes from "./routes/vehicles.js";

app.use("/api/auth", authRoutes);
app.use("/api/vehicle", vehicleRoutes);

app.listen(PORT, () => console.log("Server running on port " + PORT));

app.get("/api/db-health", async (req, res) => {
    try {
      const { rows } = await pool.query("SELECT 1 AS ok");
      res.json({ ok: true, rows });
    } catch (err) {
      console.error("DB health check failed:", err);
      res.status(500).json({ ok: false, error: err.message });
    }
  });
