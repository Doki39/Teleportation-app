import express from "express";
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { requireAuth } from "../middleware/authMiddleware.js";
import { patchUser, findUserByUid, findUserPasswordHashByUid, emailTakenByOtherUser, phoneTakenByOtherUser, deleteUser } from "../services/userService.js"; 

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
  body("current_password")
    .notEmpty()
    .withMessage("Current password is required to save changes"),
  body("new_password")
    .optional({ checkFalsy: true })
    .isString()
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters"),
  body("first_name").optional({ values: "null" }).trim().notEmpty().withMessage("First name cannot be empty"),
  body("last_name").optional({ values: "null" }).trim().notEmpty().withMessage("Last name cannot be empty"),
  body("email")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail()
    .custom(async (email, { req }) => {
      const taken = await emailTakenByOtherUser(email, req.user.uid);
      if (taken) throw new Error("Email already in use");
    }),
  body("phone_number")
    .optional({ values: "null" })
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .custom((phone) => {
      const digits = String(phone).replace(/\D/g, "");
      if (digits.length < 8) {
        throw new Error("Phone number must contain at least 8 digits");
      }
      return true;
    })
    .custom(async (phone_number, { req }) => {
      const taken = await phoneTakenByOtherUser(String(phone_number).trim(), req.user.uid);
      if (taken) throw new Error("Phone number already in use");
    }),
];
router.delete(
  "/me",
  requireAuth,
  body("password").notEmpty().withMessage("Password is required").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const uid = req.user.uid;

    try {
      const existing = await findUserByUid(uid);
      if (!existing) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordHash = await findUserPasswordHashByUid(uid);
      if (!passwordHash) {
        return res.status(500).json({ message: "Could not verify account" });
      }

      const passwordOk = await bcrypt.compare(req.body.password, passwordHash);
      if (!passwordOk) {
        return res.status(403).json({ message: "Invalid password" });
      }

      const deleted = await deleteUser(uid);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(204).send();
    } catch (err) {
      console.error("DELETE /users/me:", err);
      return res.status(500).json({ message: "Failed to delete account" });
    }
  }
);
router.patch("/me", requireAuth, patchValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const allowedKeys = ["first_name", "last_name", "email", "phone_number"];
  const newPwdRaw = req.body.new_password;
  const hasNewPassword = newPwdRaw != null && String(newPwdRaw).trim() !== "";
  const hasAny =
    allowedKeys.some((k) => Object.prototype.hasOwnProperty.call(req.body, k)) || hasNewPassword;
  if (!hasAny) {
    return res.status(400).json({ message: "No updatable fields provided" });
  }

  const uid = req.user.uid;

  try {
    const existing = await findUserByUid(uid);
    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordHash = await findUserPasswordHashByUid(uid);
    if (!passwordHash) {
      return res.status(500).json({ message: "Could not verify account" });
    }
    const passwordOk = await bcrypt.compare(req.body.current_password, passwordHash);
    if (!passwordOk) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const profilePayload = { ...req.body };
    delete profilePayload.new_password;
    delete profilePayload.current_password;

    let newPasswordHash = null;
    if (hasNewPassword) {
      newPasswordHash = await bcrypt.hash(String(newPwdRaw).trim(), 10);
    }

    const result = await patchUser(uid, profilePayload, { passwordHash: newPasswordHash });
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
