import jwt from "jsonwebtoken";
import { pool } from "../data/dbconnection.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return res.status(500).json({ message: "Server misconfiguration" });
  }
  try {
    const payload = jwt.verify(token, secret);
    if (!payload.uid) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    req.user = {
      uid: payload.uid,
      email: payload.email,
      role: payload.role ?? payload.roles ?? "user",
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

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
