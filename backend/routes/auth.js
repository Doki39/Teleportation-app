import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { pool } from "../data/dbconnection.js";
import { body, validationResult } from "express-validator";
import { findUserByEmail, findUserByPhoneNumber } from "../services/userService.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .custom(async (email) => {
        const existing = await findUserByEmail(email);
        if (existing) throw new Error("Email already registered");
      }),
    body("first_name").trim().notEmpty().withMessage("First name is required"),
    body("last_name").trim().notEmpty().withMessage("Last name is required"),
    body("phone_number")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required")
      .custom(async (phone_number) => {
        const existing = await findUserByPhoneNumber(phone_number);
        if (existing) throw new Error("Phone number already registered");
      }),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, email, phone_number, password } = req.body;
    const uid = nanoid(16);
    const password_hash = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (uid, first_name, last_name, email, phone_number, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING uid, first_name, last_name, email, phone_number;
    `;
    const values = [uid, first_name, last_name, email, phone_number, password_hash];

    try {
      const { rows } = await pool.query(insertQuery, values);
      const user = rows[0];
      return res.status(201).json({ message: "User registered!", user });
    } catch (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ message: "Registration failed" });
    }
  }
);


router.post(
  "/login",
  [
  body("email")
  .isEmail()
  .normalizeEmail(),
  body("password")
  .notEmpty(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: "Wrong email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Wrong email or password" });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set in .env");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      secret,
      { expiresIn: "14d" }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ message: "Logged in", token, user: safeUser });
  }
);

export default router;
