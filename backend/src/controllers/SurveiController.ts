import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import type { SurveiRow, SurveiRatingRow } from "../types/models.js";

/** POST /api/survei — publik, warga kirim jawaban Survei Kepuasan Masyarakat */
export async function submitSurvei(req: Request, res: Response) {
  const { nama, usia, pekerjaan, pendidikan, jenisKelamin, jenisLayanan, ratings, saran } = req.body as {
    nama?: string;
    usia?: number;
    pekerjaan?: string;
    pendidikan?: string;
    jenisKelamin?: "Laki-laki" | "Perempuan";
    jenisLayanan?: string;
    ratings?: Record<string, number>; // key = id pertanyaan, dikirim sebagai string dari JSON
    saran?: string;
  };

  if (!Number.isInteger(usia) || usia! < 1 || usia! > 120) {
    return res.status(400).json({ success: false, message: "Usia harus berupa angka antara 1-120." });
  }
  if (!pekerjaan?.trim() || !pendidikan?.trim() || !jenisLayanan?.trim()) {
    return res.status(400).json({ success: false, message: "Profil responden dan jenis layanan wajib diisi." });
  }
  if (jenisKelamin !== "Laki-laki" && jenisKelamin !== "Perempuan") {
    return res.status(400).json({ success: false, message: "Jenis kelamin tidak valid." });
  }
  if (!ratings || typeof ratings !== "object" || Array.isArray(ratings)) {
    return res.status(400).json({ success: false, message: "Rating wajib diisi." });
  }
  const questionIds = Array.from({ length: 9 }, (_, index) => String(index + 1));
  if (
    Object.keys(ratings).length !== questionIds.length ||
    questionIds.some((questionId) => !Object.hasOwn(ratings, questionId))
  ) {
    return res.status(400).json({ success: false, message: "Semua 9 unsur pelayanan wajib diberi penilaian." });
  }
  for (const [pertanyaanId, nilai] of Object.entries(ratings)) {
    if (!questionIds.includes(pertanyaanId) || !Number.isInteger(nilai) || nilai < 1 || nilai > 4) {
      return res.status(400).json({
        success: false,
        message: `Rating untuk unsur ${pertanyaanId} harus berupa angka 1-4.`,
      });
    }
  }
  if (saran !== undefined && typeof saran !== "string") {
    return res.status(400).json({ success: false, message: "Saran harus berupa teks." });
  }
  if (nama !== undefined && typeof nama !== "string") {
    return res.status(400).json({ success: false, message: "Nama harus berupa teks." });
  }
  if (nama && nama.trim().length > 150) {
    return res.status(400).json({ success: false, message: "Nama maksimal 150 karakter." });
  }

  const id = randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO survei
        (id, nama, usia, pekerjaan, pendidikan, jenis_kelamin, jenis_layanan, saran, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        nama?.trim() || null,
        usia,
        pekerjaan.trim(),
        pendidikan.trim(),
        jenisKelamin,
        jenisLayanan.trim(),
        saran?.trim() || null,
      ]
    );

    for (const [pertanyaanId, nilai] of Object.entries(ratings)) {
      await conn.query(
        "INSERT INTO survei_rating (survei_id, pertanyaan_id, rating) VALUES (?, ?, ?)",
        [id, Number(pertanyaanId), nilai]
      );
    }

    await conn.query(
      "INSERT INTO aktivitas_log (id, pesan, detail, waktu) VALUES (?, ?, ?, NOW())",
      [randomUUID(), "Survei kepuasan baru diterima dari warga", null]
    );

    await conn.commit();

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
    jenis_layanan: s.jenis_layanan,
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