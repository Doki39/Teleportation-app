import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
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

export default router;
