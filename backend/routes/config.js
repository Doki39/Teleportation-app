import express from "express";
import { isGuestHomeFlowAllowed } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public", async (_req, res) => {
  try {
    const guestHomeFlowEnabled = await isGuestHomeFlowAllowed();
    return res.json({ guestHomeFlowEnabled });
  } catch (err) {
    console.error("GET /config/public:", err);
    return res.status(500).json({ message: "Failed to load config" });
  }
});

export default router;
