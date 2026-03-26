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

export async function userIsAdmin(uid) {
  const { rows } = await pool.query("SELECT role FROM users WHERE uid = $1", [uid]);
  return rows[0]?.role === "admin";
}

export async function requireAdmin(req, res, next) {
  try {
    if (!(await userIsAdmin(req.user.uid))) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error("requireAdmin:", err);
    return res.status(500).json({ message: "Authorization check failed" });
  }
}

const MAX_GENERATIONS_PER_USER = 3;

export async function requireGenerationQuota(req, res, next) {
  try {
    if (await userIsAdmin(req.user.uid)) return next();
    const { rows } = await pool.query(
      "SELECT COUNT(*)::int AS c FROM photos WHERE uid = $1",
      [req.user.uid]
    );
    const count = rows[0]?.c ?? 0;
    if (count >= MAX_GENERATIONS_PER_USER) {
      return res.status(403).json({
        message:
          "You have reached the limit of 3 generations for your account. Contact an administrator if you need more.",
        code: "GENERATION_LIMIT",
      });
    }
    next();
  } catch (err) {
    console.error("requireGenerationQuota:", err);
    return res.status(500).json({ message: "Could not verify generation quota" });
  }
}