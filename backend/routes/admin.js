import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { pool } from "../data/dbconnection.js";
import { updateBonusGenerationsByEmail } from "../services/userService.js";

const router = express.Router();

const DEFAULT_GENERATION_CAP = 3;

router.patch(
  "/users/bonus-generations",
  requireAuth,
  requireAdmin,
  body("email").trim().isEmail().normalizeEmail().withMessage("Valid email required"),
  body("bonusGenerations")
    .isInt({ min: 0, max: 9999 })
    .withMessage("bonusGenerations must be an integer from 0 to 9999"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || "Invalid input" });
    }

    const email = String(req.body.email).trim();
    const bonusGenerations = Number.parseInt(String(req.body.bonusGenerations), 10);

    try {
      const result = await updateBonusGenerationsByEmail(email, bonusGenerations);
      if (result.error === "not_found") {
        return res.status(404).json({ message: "No user found with that email" });
      }
      return res.json({
        user: result.user,
        defaultCap: DEFAULT_GENERATION_CAP,
        effectiveLimit: DEFAULT_GENERATION_CAP + result.user.bonus_generations,
      });
    } catch (err) {
      console.error("PATCH /admin/users/bonus-generations:", err);
      return res.status(500).json({ message: err.message || "Failed to update bonus generations" });
    }
  }
);

router.get("/photo-rotation", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, image_url, location FROM photo_rotation ORDER BY id DESC"
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /admin/photo-rotation:", err);
    return res.status(500).json({ message: err.message || "Failed to load rotation" });
  }
});

router.delete("/photo-rotation/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number.parseInt(String(req.params.id), 10);
  if (!Number.isFinite(id) || id < 1) {
    return res.status(400).json({ message: "Invalid id" });
  }
  try {
    const { rowCount } = await pool.query("DELETE FROM photo_rotation WHERE id = $1", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Rotation entry not found" });
    }
    return res.status(204).send();
  } catch (err) {
    console.error("DELETE /admin/photo-rotation:", err);
    return res.status(500).json({ message: err.message || "Failed to remove rotation entry" });
  }
});

router.post(
  "/photo-rotation",
  requireAuth,
  requireAdmin,
  body("imageUrl").trim().isLength({ min: 1, max: 4096 }).withMessage("imageUrl is required"),
  body("location").trim().isLength({ min: 1, max: 500 }).withMessage("location is required"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0]?.msg || "Invalid input" });
    }

    const imageUrl = String(req.body.imageUrl).trim();
    const location = String(req.body.location).trim();

    try {
      const { rows } = await pool.query(
        `INSERT INTO photo_rotation (image_url, location) VALUES ($1, $2)
         RETURNING id, image_url, location`,
        [imageUrl, location]
      );
      return res.status(201).json(rows[0]);
    } catch (err) {
      console.error("POST /admin/photo-rotation:", err);
      return res.status(500).json({ message: err.message || "Failed to add rotation entry" });
    }
  }
);

export default router;
