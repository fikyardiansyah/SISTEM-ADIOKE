import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "antrean_adioke",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  decimalNumbers: true,
  // TAMBAHAN WAJIB UNTUK TIDB SERVERLESS
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

export async function pastikanKoneksiDb() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
    console.log("✅ Koneksi MySQL berhasil");
  } finally {
    conn.release();
  }
}