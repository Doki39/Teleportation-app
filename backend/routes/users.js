import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware.js";
import { patchUser, findUserByUid, emailTakenByOtherUser, phoneTakenByOtherUser} from "../services/userService.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserByUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({ user });
  } catch (err) {
    console.error("GET /users/me:", err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
});

const patchValidators = [
  body("first_name").optional({ values: "null" }).trim().notEmpty().withMessage("First name cannot be empty"),
  body("last_name").optional({ values: "null" }).trim().notEmpty().withMessage("Last name cannot be empty"),
  body("email").optional({ values: "null" }).isEmail().withMessage("Invalid email").normalizeEmail(),
  body("phone_number")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Phone number cannot be empty"),
];

router.patch("/me", requireAuth, patchValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const allowedKeys = ["first_name", "last_name", "email", "phone_number"];
  const hasAny = allowedKeys.some((k) => Object.prototype.hasOwnProperty.call(req.body, k));
  if (!hasAny) {
    return res.status(400).json({ message: "No updatable fields provided" });
  }

  const uid = req.user.uid;

  try {
    const existing = await findUserByUid(uid);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.email) {
      const taken = await emailTakenByOtherUser(req.body.email, uid);
      if (taken) {
        return res.status(409).json({ message: "Email already in use" });
      }
    }
    if (req.body.phone_number) {
      const taken = await phoneTakenByOtherUser(req.body.phone_number.trim(), uid);
      if (taken) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
    }

    const result = await patchUser(uid, req.body);
    if (result.error === "empty") {
      return res.status(400).json({ message: result.message });
    }
    if (result.error === "not_found") {
      return res.status(404).json({ message: result.message });
    }

    return res.json({ user: result.user });
  } catch (err) {
    console.error("PATCH /users/me:", err);
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

export default router;
