import { pool } from "../data/dbconnection.js";

let ensured = false;

export async function syncPhotosIdSequence() {
  const { rows } = await pool.query(
    "SELECT pg_get_serial_sequence('public.photos', 'id') AS seqname"
  );
  const seqname = rows[0]?.seqname;
  if (!seqname) return;
  await pool.query(
    `SELECT setval(
      $1::regclass,
      GREATEST(COALESCE((SELECT MAX(id) FROM photos), 0), 1),
      COALESCE((SELECT MAX(id) FROM photos), 0) > 0
    )`,
    [seqname]
  );
}

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
  try {
    await syncPhotosIdSequence();
  } catch (e) {
    console.warn("[photosSchema] Could not sync photos id sequence:", e.message);
  }
  ensured = true;
}
