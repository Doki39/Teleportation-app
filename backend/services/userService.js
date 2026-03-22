import { pool } from "../data/dbconnection.js";

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    "SELECT uid, email, password_hash, first_name, last_name, phone_number FROM users WHERE email = $1",
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserByUid(uid) {
  const { rows } = await pool.query(
    "SELECT uid, email, first_name, last_name, phone_number FROM users WHERE uid = $1",
    [uid]
  );
  return rows[0] ?? null;
}

export async function emailTakenByOtherUser(email, excludeUid) {
  const { rows } = await pool.query(
    "SELECT uid FROM users WHERE email = $1 AND uid <> $2",
    [email, excludeUid]
  );
  return rows.length > 0;
}

export async function phoneTakenByOtherUser(phone_number, excludeUid) {
  const { rows } = await pool.query(
    "SELECT uid FROM users WHERE phone_number = $1 AND uid <> $2",
    [phone_number, excludeUid]
  );
  return rows.length > 0;
}

export async function isPhoneNumberRegistered(phone_number) {
  const { rows } = await pool.query(
    "SELECT 1 FROM users WHERE phone_number = $1 LIMIT 1",
    [phone_number]
  );
  return rows.length > 0;
}

const PATCHABLE = ["first_name", "last_name", "email", "phone_number"];

export async function patchUser(uid, rawBody) {
  const updates = {};
  for (const key of PATCHABLE) {
    if (Object.prototype.hasOwnProperty.call(rawBody, key)) {
      let val = rawBody[key];
      if (typeof val === "string") {
        val = val.trim();
      }
      updates[key] = val;
    }
  }

  const keys = Object.keys(updates).filter((k) => updates[k] !== undefined && updates[k] !== "");
  if (keys.length === 0) {
    return { error: "empty", message: "No updatable fields provided" };
  }

  const fragments = [];
  const values = [];
  let i = 1;
  for (const key of keys) {
    fragments.push(`${key} = $${i}`);
    values.push(updates[key]);
    i++;
  }
  values.push(uid);

  const sql = `
    UPDATE users
    SET ${fragments.join(", ")}
    WHERE uid = $${i}
    RETURNING uid, first_name, last_name, email, phone_number
  `;
  const { rows } = await pool.query(sql, values);
  if (rows.length === 0) {
    return { error: "not_found", message: "User not found" };
  }
  return { user: rows[0] };
}