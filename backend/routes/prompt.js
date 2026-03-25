import express from "express";
import { pool } from "../data/dbconnection.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const PATCHABLE = ["title", "prompt", "image_url"];

function uniqueViolationMessage(err) {
  const c = err?.constraint || "";
  if (c.includes("image_url")) {
    return "This image is already used for another destination. Use a different preview image.";
  }
  if (c.includes("title_prompt")) {
    return "A destination with this title and the same prompt text already exists.";
  }
  return "That combination already exists. Change the title, prompt, or image.";
}

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const title = String(req.body?.title ?? "").trim() || "Untitled";
    const prompt = String(req.body?.prompt ?? "").trim();
    const image_url = String(req.body?.image_url ?? "").trim();

    if (!prompt) {
      return res.status(400).json({ message: "Prompt text is required" });
    }
    if (!image_url) {
      return res.status(400).json({ message: "image_url is required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO prompt_selection (title, prompt, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, prompt, image_url]
    );
    return res.status(201).json({ prompt: rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: uniqueViolationMessage(err) });
    }
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to create prompt" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
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
    if (err.code === "23505") {
      return res.status(409).json({ message: uniqueViolationMessage(err) });
    }
    console.error(err);
    res.status(500).json({ message: err.message || "Failed to update prompt" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query("DELETE FROM prompt_selection WHERE id = $1", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Prompt not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || "Failed to delete prompt" });
  }
});

export default router;
