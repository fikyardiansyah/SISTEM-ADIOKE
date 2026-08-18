import type { Request, Response } from "express";
import { pool } from "../config/db.js";
import type { RingkasanLoketRow, LayananRow } from "../types/models.js";
import { catatAktivitas } from "./AktivitasController.js";

function buatSlug(nama: string) {
  return nama
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** GET /api/layanan — dipakai Portal, HomePage, AdminLoketListPage (pakai VIEW ringkasan) */
export async function getSemuaLayanan(_req: Request, res: Response) {
  const [rows] = await pool.query<RingkasanLoketRow[]>(
    `SELECT r.*, l.nama_loket, l.prefix, l.icon, l.deskripsi, l.variant
     FROM v_ringkasan_loket r
     JOIN layanan l ON l.id = r.id
     ORDER BY l.created_at ASC`
  );
  res.json({ success: true, data: rows });
}

/** GET /api/layanan/:id */
export async function getLayananById(req: Request, res: Response) {
  const [rows] = await pool.query<LayananRow[]>("SELECT * FROM layanan WHERE id = ? LIMIT 1", [
    req.params.id,
  ]);
  if (!rows[0]) return res.status(404).json({ success: false, message: "Loket tidak ditemukan." });
  res.json({ success: true, data: rows[0] });
}

/** POST /api/layanan — Tambah Layanan Loket (admin) */
export async function tambahLayanan(req: Request, res: Response) {
  const { nama, namaLoket, prefix, jumlahAntrianAwal, icon, kategori, deskripsi, variant, statusAwal } =
    req.body as {
      nama?: string;
      namaLoket?: string;
      prefix?: string;
      jumlahAntrianAwal?: number;
      icon?: string;
      kategori?: string;
      deskripsi?: string;
      variant?: "biru" | "merah";
      statusAwal?: "buka" | "tutup";
    };

  if (!nama?.trim() || !prefix?.trim() || !icon) {
    return res.status(400).json({ success: false, message: "Nama, prefix, dan ikon wajib diisi." });
  }

  let id = buatSlug(nama);
  let counter = 2;
  // Pastikan id tidak bentrok dengan loket yang sudah ada, sama seperti logika di frontend
  while (true) {
    const [existing] = await pool.query<LayananRow[]>("SELECT id FROM layanan WHERE id = ?", [id]);
    if (existing.length === 0) break;
    id = `${buatSlug(nama)}-${counter}`;
    counter += 1;
  }

  await pool.query(
    `INSERT INTO layanan (id, nama, nama_loket, prefix, jumlah_antrian_awal, icon, kategori, deskripsi, variant, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      nama.trim(),
      namaLoket?.trim() || `LAYANAN ${nama.trim().toUpperCase()}`,
      prefix.trim().toUpperCase().slice(0, 1),
      jumlahAntrianAwal ?? 0,
      icon,
      kategori ?? null,
      deskripsi ?? null,
      variant ?? "biru",
      statusAwal ?? "buka",
    ]
  );

  // Kalau kategori loket baru belum ada di daftar kategori, otomatis ditambahkan (samakan perilaku frontend)
  if (kategori) {
    await pool.query("INSERT IGNORE INTO kategori_layanan (nama, icon) VALUES (?, 'tag')", [kategori]);
  }

  await catatAktivitas("Loket baru ditambahkan", nama.trim());

  const [rows] = await pool.query<LayananRow[]>("SELECT * FROM layanan WHERE id = ?", [id]);
  res.status(201).json({ success: true, data: rows[0] });
}

/** PATCH /api/layanan/:id/status — buka/tutup loket */
export async function ubahStatusLayanan(req: Request, res: Response) {
  const { status } = req.body as { status?: "buka" | "tutup" };
  if (status !== "buka" && status !== "tutup") {
    return res.status(400).json({ success: false, message: "Status harus 'buka' atau 'tutup'." });
  }

  const [rows] = await pool.query<LayananRow[]>("SELECT nama FROM layanan WHERE id = ?", [
    req.params.id,
  ]);
  if (!rows[0]) return res.status(404).json({ success: false, message: "Loket tidak ditemukan." });

  await pool.query("UPDATE layanan SET status = ? WHERE id = ?", [status, req.params.id]);
  await catatAktivitas(
    `Layanan ${rows[0].nama} ${status === "buka" ? "diaktifkan" : "dinonaktifkan"}`
  );

  res.json({ success: true, message: "Status loket diperbarui." });
}

/** DELETE /api/layanan/:id */
export async function hapusLayanan(req: Request, res: Response) {
  const [result] = await pool.query("DELETE FROM layanan WHERE id = ?", [req.params.id]);
  const affected = (result as { affectedRows: number }).affectedRows;
  if (affected === 0) return res.status(404).json({ success: false, message: "Loket tidak ditemukan." });
  res.json({ success: true, message: "Loket dihapus." });
}