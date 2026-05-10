import { pool } from "../data/dbconnection.js";

const GUEST_HOME_FLOW_KEY = "guest_home_flow";

let tableEnsured = false;

export async function ensureAppSettingsTable() {
  if (tableEnsured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(128) PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, 'false')
     ON CONFLICT (key) DO NOTHING`,
    [GUEST_HOME_FLOW_KEY]
  );
  tableEnsured = true;
}

function parseBool(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes";
}

export async function getGuestHomeFlowEnabled() {
  await ensureAppSettingsTable();
  const { rows } = await pool.query("SELECT value FROM app_settings WHERE key = $1", [
    GUEST_HOME_FLOW_KEY,
  ]);
  return parseBool(rows[0]?.value);
}

export async function setGuestHomeFlowEnabled(enabled) {
  await ensureAppSettingsTable();
  const v = enabled ? "true" : "false";
  await pool.query(
    `INSERT INTO app_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [GUEST_HOME_FLOW_KEY, v]
  );
}
