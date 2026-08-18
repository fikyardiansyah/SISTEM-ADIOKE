import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Connection pool — jangan buat koneksi baru di tiap request, cukup satu
// pool ini yang di-reuse di seluruh controller lewat `import { pool } from ...`.
export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "antrean_adioke",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true, // biar DATETIME/DATE dari MySQL balik sebagai string ISO-ish, bukan objek Date lokal server
  // PENTING: tanpa ini, kolom hasil SUM()/DECIMAL (mis. `dilayani` dan
  // `menunggu` di VIEW v_ringkasan_loket, yang pakai SUM(CASE WHEN...))
  // dibalikin mysql2 sebagai STRING ("0", "2", dst), bukan angka — beda
  // dengan COUNT() yang otomatis jadi number. Akibatnya kalau nilai itu
  // dipakai reduce/+  di frontend, ketimbang dijumlah malah nyambung jadi
  // teks (mis. "0000000"). decimalNumbers:true bikin semua DECIMAL/NUMERIC
  // konsisten balik sebagai JS number.
  decimalNumbers: true,
});

/** Panggil ini sekali saat server start untuk memastikan koneksi DB benar-benar hidup,
 *  supaya error konfigurasi (host/password salah, dsb) ketahuan langsung di awal,
 *  bukan baru pas ada request pertama masuk. */
export async function pastikanKoneksiDb() {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
    console.log("✅ Koneksi MySQL berhasil");
  } finally {
    conn.release();
  }
}