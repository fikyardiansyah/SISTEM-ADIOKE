import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import type { AntrianRow, LayananRow } from "../types/models.js";
import { catatAktivitas } from "./AktivitasController.js";

/** POST /api/antrian — warga ambil nomor tiket baru untuk satu loket */
export async function ambilAntrian(req: Request, res: Response) {
  const { loketId } = req.body as { loketId?: string };
  if (!loketId) return res.status(400).json({ success: false, message: "loketId wajib diisi." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Kunci baris loket ini supaya aman kalau ada 2 warga ambil tiket bersamaan (race condition)
    const [loketRows] = await conn.query<LayananRow[]>(
      "SELECT * FROM layanan WHERE id = ? FOR UPDATE",
      [loketId]
    );
    const loket = loketRows[0];
    if (!loket) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Loket tidak ditemukan." });
    }
    if (loket.status === "tutup") {
      await conn.rollback();
      return res.status(400).json({ success: false, message: "Loket sedang tutup, tidak bisa ambil tiket." });
    }

    const nomorBerikutnya = loket.counter_terakhir + 1;
    const nomorTiket = `${loket.prefix}${String(nomorBerikutnya).padStart(3, "0")}`;
    const id = randomUUID();

    await conn.query(
      "INSERT INTO antrian (id, loket_id, nomor_tiket, status, waktu_ambil) VALUES (?, ?, ?, 'menunggu', NOW())",
      [id, loketId, nomorTiket]
    );
    await conn.query("UPDATE layanan SET counter_terakhir = ? WHERE id = ?", [
      nomorBerikutnya,
      loketId,
    ]);

    await conn.commit();

    res.status(201).json({
      success: true,
      data: { id, loketId, nomorTiket, status: "menunggu" },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** PATCH /api/antrian/loket/:loketId/panggil-selanjutnya — admin panggil tiket berikutnya di satu loket */
export async function panggilSelanjutnya(req: Request, res: Response) {
  const { loketId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [tiketRows] = await conn.query<AntrianRow[]>(
      `SELECT * FROM antrian WHERE loket_id = ? AND status = 'menunggu'
       ORDER BY waktu_ambil ASC LIMIT 1 FOR UPDATE`,
      [loketId]
    );
    const tiket = tiketRows[0];

    if (!tiket) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Tidak ada tiket yang menunggu di loket ini." });
    }

    await conn.query(
      "UPDATE antrian SET status = 'dilayani', waktu_dilayani = NOW() WHERE id = ?",
      [tiket.id]
    );

    const [loketRows] = await conn.query<LayananRow[]>("SELECT nama FROM layanan WHERE id = ?", [
      loketId,
    ]);

    await conn.commit();

    if (loketRows[0]) {
      await catatAktivitas(`${loketRows[0].nama} memanggil antrean`, tiket.nomor_tiket);
    }

    res.json({ success: true, data: { ...tiket, status: "dilayani" } });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** GET /api/antrian?loketId=xxx&status=menunggu — riwayat tiket, dipakai Laporan & Dashboard */
export async function getAntrian(req: Request, res: Response) {
  const { loketId, status } = req.query as { loketId?: string; status?: string };

  let sql = "SELECT * FROM antrian WHERE 1=1";
  const params: unknown[] = [];

  if (loketId) {
    sql += " AND loket_id = ?";
    params.push(loketId);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY waktu_ambil DESC LIMIT 500";

  const [rows] = await pool.query<AntrianRow[]>(sql, params);
  res.json({ success: true, data: rows });
}

/**
 * DELETE /api/antrian/reset — HAPUS PERMANEN semua tiket, kembalikan
 * counter_terakhir semua loket ke 0 (nomor tiket mulai dari 001 lagi), dan
 * buka semua loket yang tadinya tutup.
 *
 * Operasi DESTRUKTIF & TIDAK BISA DIBATALKAN — hanya boleh dipanggil oleh
 * Super Admin (dibatasi lewat requireRole di route-nya, bukan di sini).
 */
export async function resetSemuaAntrian(req: Request, res: Response) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("DELETE FROM antrian");
    await conn.query("UPDATE layanan SET counter_terakhir = 0, status = 'buka'");

    await conn.commit();

    await catatAktivitas(
      `Reset semua antrian dilakukan`,
      req.user?.username ? `oleh ${req.user.username}` : undefined
    );

    res.json({ success: true, message: "Semua antrian berhasil direset." });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}