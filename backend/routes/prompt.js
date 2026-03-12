import express from "express";
import { pool } from "../data/dbconnection.js";
const router = express.Router();

router.get("/", async (req,res) => {

try {
    const { rows } = await pool.query(
    "SELECT * FROM prompt_selection"
    );
    return res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
})

export default router;