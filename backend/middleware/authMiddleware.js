import jwt from "jsonwebtoken";
import { pool } from "../data/dbconnection.js";
import { getGuestHomeFlowEnabled } from "../services/appSettingsService.js";

export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = header.slice("Bearer ".length).trim();
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, secret);
    if (!payload.uid) {
      req.user = null;
      return next();
    }
    req.user = {
      uid: payload.uid,
      email: payload.email,
      role: payload.role ?? payload.roles ?? "user",
    };
    next();
  } catch {
    req.user = null;
    next();
  }
}

export async function isGuestHomeFlowAllowed() {
  if (process.env.ALLOW_GUEST_HOME_FLOW === "true") return true;
  try {
    return await getGuestHomeFlowEnabled();
  } catch (e) {
    console.error("isGuestHomeFlowAllowed:", e);
    return false;
  }
}

export async function requireUserOrGuestHomeFlow(req, res, next) {
  if (req.user) return next();
  try {
    if (await isGuestHomeFlowAllowed()) return next();
  } catch (e) {
    console.error("requireUserOrGuestHomeFlow:", e);
    return res.status(500).json({ message: "Server error" });
  }
  return res.status(401).json({ message: "Unauthorized" });
}

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

export const MAX_GENERATIONS_PER_USER = 3;

function normalizeGuestSessionIdForQuota(raw) {
  const s = String(raw ?? "").trim();
  if (!s || s.length > 64) return null;
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) return null;
  return s;
}

export async function requireGenerationQuota(req, res, next) {
  try {
    if (await userIsAdmin(req.user.uid)) return next();
    const { rows } = await pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM photos WHERE uid = $1) AS c,
         COALESCE(u.bonus_generations, 0)::int AS bonus
       FROM users u
       WHERE u.uid = $1`,
      [req.user.uid]
    );
    const count = rows[0]?.c ?? 0;
    const bonus = rows[0]?.bonus ?? 0;
    const limit = MAX_GENERATIONS_PER_USER + bonus;
    if (count >= limit) {
      return res.status(403).json({
        message:
          "You have reached the limit of generations for your account. Contact support if you need more.",
        code: "GENERATION_LIMIT",
      });
    }
    next();
  } catch (err) {
    console.error("requireGenerationQuota:", err);
    return res.status(500).json({ message: "Could not verify generation quota" });
  }
}

async function guestGenerationCount(guestSessionId) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS c FROM photos WHERE guest_session_id = $1",
    [guestSessionId]
  );
  return rows[0]?.c ?? 0;
}

export async function requireGenerationQuotaUniversal(req, res, next) {
  try {
    if (req.user) {
      if (await userIsAdmin(req.user.uid)) return next();
      return requireGenerationQuota(req, res, next);
    }
    const guestSessionId = normalizeGuestSessionIdForQuota(req.body?.guestSessionId);
    if (!guestSessionId) {
      return res.status(400).json({ message: "guestSessionId is required for guest generation" });
    }
    const count = await guestGenerationCount(guestSessionId);
    if (count >= MAX_GENERATIONS_PER_USER) {
      return res.status(403).json({
        message:
          "You have reached the limit of generations for this guest session (3). Sign in for an account or contact support if you need more.",
        code: "GENERATION_LIMIT",
      });
    }
    next();
  } catch (err) {
    console.error("requireGenerationQuotaUniversal:", err);
    return res.status(500).json({ message: "Could not verify generation quota" });
  }
}

export async function requireGuestGenerationQuotaAfterUpload(req, res, next) {
  if (req.user) return next();
  try {
    const guestSessionId = normalizeGuestSessionIdForQuota(req.body?.guestSessionId);
    if (!guestSessionId) {
      return res.status(400).json({ message: "guestSessionId is required for guest upload" });
    }
    const count = await guestGenerationCount(guestSessionId);
    if (count >= MAX_GENERATIONS_PER_USER) {
      return res.status(403).json({
        message:
          "You have reached the limit of generations for this guest session (3). Sign in for an account or contact support if you need more.",
        code: "GENERATION_LIMIT",
      });
    }
    next();
  } catch (err) {
    console.error("requireGuestGenerationQuotaAfterUpload:", err);
    return res.status(500).json({ message: "Could not verify generation quota" });
  }
}