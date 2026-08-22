import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import type { RekapHarianRow } from "../types/models.js";

/** GET /api/rekap-harian — kembalikan semua rekap harian tersimpan,
 *  diurutkan dari terlama ke terbaru agar frontend bisa bangun tren kronologis. */
export async function getRekapHarian(_req: Request, res: Response) {
  const [rows] = await pool.query<RekapHarianRow[]>(
    "SELECT * FROM rekap_harian ORDER BY tanggal ASC, loket_id ASC"
  );
  res.json({ success: true, data: rows });
}
