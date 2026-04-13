import express from "express";
import { pool } from "../data/dbconnection.js";

const router = express.Router();

router.get("/slides", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM photo_rotation");
    return res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch slide photos" });
  }
});

export default router;
