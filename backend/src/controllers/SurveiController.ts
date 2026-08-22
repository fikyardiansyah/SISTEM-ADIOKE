import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import type { SurveiRow, SurveiRatingRow } from "../types/models.js";
import { catatAktivitas } from "./AktivitasController.js";

/** POST /api/survei — publik, warga kirim jawaban Survei Kepuasan Masyarakat */
export async function submitSurvei(req: Request, res: Response) {
  const { nama, ratings, saran } = req.body as {
    nama?: string;
    ratings?: Record<string, number>; // key = id pertanyaan, dikirim sebagai string dari JSON
    saran?: string;
  };

  if (!ratings || Object.keys(ratings).length === 0) {
    return res.status(400).json({ success: false, message: "Rating wajib diisi." });
  }

  // Validasi dulu di sini (walau CHECK constraint di DB juga menjaga ini)
  // supaya pesan errornya jelas, bukan 500 mentah dari MySQL.
  for (const [pertanyaanId, nilai] of Object.entries(ratings)) {
    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
      return res.status(400).json({
        success: false,
        message: `Rating untuk pertanyaan ${pertanyaanId} harus berupa angka 1-5.`,
      });
    }
  }

  const id = randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("INSERT INTO survei (id, nama, saran, created_at) VALUES (?, ?, ?, NOW())", [
      id,
      nama?.trim() || null,
      saran?.trim() || null,
    ]);

    for (const [pertanyaanId, nilai] of Object.entries(ratings)) {
      await conn.query(
        "INSERT INTO survei_rating (survei_id, pertanyaan_id, rating) VALUES (?, ?, ?)",
        [id, Number(pertanyaanId), nilai]
      );
    }

    await conn.commit();

    await catatAktivitas("Survei kepuasan baru diterima dari warga");

    res.status(201).json({ success: true, data: { id } });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** GET /api/survei — admin, ambil semua submission lengkap dengan rating per pertanyaan */
export async function getSurvei(_req: Request, res: Response) {
  const [surveiRows] = await pool.query<SurveiRow[]>(
    "SELECT * FROM survei ORDER BY created_at DESC"
  );
  const [ratingRows] = await pool.query<SurveiRatingRow[]>("SELECT * FROM survei_rating");

  const ratingBySurvei = new Map<string, Record<number, number>>();
  ratingRows.forEach((r) => {
    if (!ratingBySurvei.has(r.survei_id)) ratingBySurvei.set(r.survei_id, {});
    ratingBySurvei.get(r.survei_id)![r.pertanyaan_id] = r.rating;
  });

  const data = surveiRows.map((s) => ({
    id: s.id,
    nama: s.nama,
    saran: s.saran,
    created_at: s.created_at,
    ratings: ratingBySurvei.get(s.id) ?? {},
  }));

  res.json({ success: true, data });
}

/** DELETE /api/survei/:id — admin hapus satu respons (survei_rating ikut terhapus lewat FK CASCADE) */
export async function hapusSurvei(req: Request, res: Response) {
  const [result] = await pool.query("DELETE FROM survei WHERE id = ?", [req.params.id]);
  const affected = (result as { affectedRows: number }).affectedRows;
  if (affected === 0) {
    return res.status(404).json({ success: false, message: "Survei tidak ditemukan." });
  }
  res.json({ success: true, message: "Respons survei dihapus." });
}