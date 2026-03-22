import { pool } from "../data/dbconnection.js";

export async function requireAdmin(req, res, next) {
  try {
    const { rows } = await pool.query("SELECT role FROM users WHERE uid = $1", [req.user.uid]);
    if (rows[0]?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error("requireAdmin:", err);
    return res.status(500).json({ message: "Authorization check failed" });
  }
}
