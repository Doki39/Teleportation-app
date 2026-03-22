import jwt from "jsonwebtoken";

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
