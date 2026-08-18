import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import type { AktivitasRow } from "../types/models.js";

const MAKS_AKTIVITAS_DIKEMBALIKAN = 30;

/**
 * Helper (BUKAN route handler) — dipanggil dari controller lain
 * (AntrianController, LayananController, dst) tiap kali ada kejadian yang
 * perlu masuk feed "Aktivitas Terbaru" di dashboard admin. Sengaja tidak
 * dibungkus try/catch di sini: kalau insert log gagal, biarkan error itu
 * naik ke caller-nya (jangan sampai "sukses palsu" — aksi utamanya sudah
 * commit duluan sebelum fungsi ini dipanggil, jadi kegagalan di sini murni
 * masalah logging, tapi tetap harus kelihatan di server log, bukan ditelan
 * diam-diam).
 */
export async function catatAktivitas(pesan: string, detail?: string) {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO aktivitas_log (id, pesan, detail, waktu) VALUES (?, ?, ?, NOW())",
    [id, pesan, detail ?? null]
  );
}

/**
 * GET /api/aktivitas — feed "Aktivitas Terbaru" di dashboard admin
 * (AdminLayout.tsx, dropdown notifikasi). Terbaru duluan, dibatasi 30
 * entri terakhir — sama seperti perilaku `.slice(0, 30)` yang tadinya ada
 * di QueueProvider.tsx versi frontend-only.
 */
export async function getAktivitas(_req: Request, res: Response) {
  const [rows] = await pool.query<AktivitasRow[]>(
    "SELECT * FROM aktivitas_log ORDER BY waktu DESC LIMIT ?",
    [MAKS_AKTIVITAS_DIKEMBALIKAN]
  );
  res.json({ success: true, data: rows });
}