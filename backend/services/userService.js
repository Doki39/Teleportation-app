import { pool } from "../data/dbconnection.js";


export async function findUserByEmail(email) {
    const { rows } = await pool.query(
      "SELECT uid, email, password_hash, first_name, last_name, phone_number FROM users WHERE email = $1",
      [email]
    );
    return rows[0] ?? null;
  }
  
export async function findUserByPhoneNumber(phone_number) {
    const { rows } = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1",
      [phone_number]
    );
    return rows[0] ?? null;
  }