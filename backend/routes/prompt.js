import express from "express";
import { pool } from "../data/dbconnection.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

const PATCHABLE = ["title", "prompt", "image_url"];

router.get("/", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM prompt_selection");
    return res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch prompts" });
  }
});

router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const raw = req.body || {};

    const updates = {};
    for (const key of PATCHABLE) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        let val = raw[key];
        if (typeof val === "string") {
          val = val.trim();
        }
        updates[key] = val;
      }
    }

    const keys = Object.keys(updates).filter((k) => updates[k] !== undefined && updates[k] !== "");
    if (keys.length === 0) {
      return res.status(400).json({ message: "No fields to update (title, prompt, image_url)" });
    }

    const fragments = [];
    const values = [];
    let i = 1;
    for (const key of keys) {
      fragments.push(`${key} = $${i}`);
      values.push(updates[key]);
      i++;
    }
    values.push(id);

    const sql = `
      UPDATE prompt_selection
      SET ${fragments.join(", ")}
      WHERE id = $${i}
      RETURNING *
    `;
    const { rows } = await pool.query(sql, values);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    return res.json({ prompt: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to update prompt" });
  }
});

export default router;
