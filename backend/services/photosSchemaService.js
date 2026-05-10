import { pool } from "../data/dbconnection.js";

let ensured = false;

export async function ensurePhotosGuestSessionSupport() {
  if (ensured) return;
  await pool.query(
    `ALTER TABLE photos ADD COLUMN IF NOT EXISTS guest_session_id VARCHAR(64)`
  );
  try {
    await pool.query(`ALTER TABLE photos ALTER COLUMN uid DROP NOT NULL`);
  } catch (e) {
    console.warn("[photosSchema] Could not make uid nullable (FK or permissions):", e.message);
  }
  ensured = true;
}
