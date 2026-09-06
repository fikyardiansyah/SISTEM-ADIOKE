import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db.js";
import type { JamOperasionalRow, PengaturanSistemRow } from "../types/models.js";

export interface JamOperasionalSetting {
  hari: string;
  jam_buka: string;
  jam_tutup: string;
  aktif: boolean;
}

export interface PengaturanSistemPayload {
  namaInstansi: string;
  alamatLengkap: string;
  nomorTelepon: string;
  emailResmi: string;
  logoUrl: string;
  jamOperasional: JamOperasionalSetting[];
  notifPanggilanAntrean: boolean;
  notifPeringatanSistem: boolean;
  volumeUtama: number;
}

const defaultPengaturan: PengaturanSistemPayload = {
  namaInstansi: "Kecamatan Kuta Selatan",
  alamatLengkap: "Jl. Raya Kampus Unud No.X, Jimbaran, Kec. Kuta Sel., Kabupaten Badung, Bali",
  nomorTelepon: "(0361) 701001",
  emailResmi: "info@kutaselatan.badungkab.go.id",
  logoUrl: "/images/logo-badung.png",
  jamOperasional: [
    { hari: "Senin", jam_buka: "08:00", jam_tutup: "15:00", aktif: true },
    { hari: "Selasa", jam_buka: "08:00", jam_tutup: "15:00", aktif: true },
    { hari: "Rabu", jam_buka: "08:00", jam_tutup: "15:00", aktif: true },
    { hari: "Kamis", jam_buka: "08:00", jam_tutup: "15:00", aktif: true },
    { hari: "Jumat", jam_buka: "08:00", jam_tutup: "15:00", aktif: true },
    { hari: "Sabtu", jam_buka: "08:00", jam_tutup: "12:00", aktif: false },
    { hari: "Minggu", jam_buka: "08:00", jam_tutup: "12:00", aktif: false },
  ],
  notifPanggilanAntrean: true,
  notifPeringatanSistem: true,
  volumeUtama: 80,
};

let inMemoryPengaturan: PengaturanSistemPayload = { ...defaultPengaturan };

function normalisasiJamOperasional(value: unknown): JamOperasionalSetting[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [...defaultPengaturan.jamOperasional];
  }

  return value.map((hari, index) => ({
    hari: typeof hari?.hari === "string" ? hari.hari : defaultPengaturan.jamOperasional[index]?.hari ?? `Hari ${index + 1}`,
    jam_buka: typeof hari?.jam_buka === "string" ? hari.jam_buka : typeof hari?.buka === "string" ? hari.buka : "08:00",
    jam_tutup: typeof hari?.jam_tutup === "string" ? hari.jam_tutup : typeof hari?.tutup === "string" ? hari.tutup : "15:00",
    aktif: typeof hari?.aktif === "boolean" ? hari.aktif : true,
  }));
}

function normalisasiPayload(payload: Partial<PengaturanSistemPayload> | undefined): PengaturanSistemPayload {
  const base = { ...defaultPengaturan, ...inMemoryPengaturan, ...(payload ?? {}) };
  return {
    ...base,
    namaInstansi: String(base.namaInstansi ?? defaultPengaturan.namaInstansi),
    alamatLengkap: String(base.alamatLengkap ?? defaultPengaturan.alamatLengkap),
    nomorTelepon: String(base.nomorTelepon ?? defaultPengaturan.nomorTelepon),
    emailResmi: String(base.emailResmi ?? defaultPengaturan.emailResmi),
    logoUrl: String(base.logoUrl ?? defaultPengaturan.logoUrl),
    jamOperasional: normalisasiJamOperasional(base.jamOperasional),
    notifPanggilanAntrean: Boolean(base.notifPanggilanAntrean),
    notifPeringatanSistem: Boolean(base.notifPeringatanSistem),
    volumeUtama: Math.min(100, Math.max(0, Number(base.volumeUtama ?? defaultPengaturan.volumeUtama))),
  };
}

async function loadFromDatabase(): Promise<PengaturanSistemPayload | null> {
  try {
    const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'pengaturan_sistem'");
    if (tables.length === 0) {
      return null;
    }

    const [pengaturanRows] = await pool.query<PengaturanSistemRow[]>(
      "SELECT * FROM pengaturan_sistem ORDER BY id DESC LIMIT 1"
    );

    const [jamRows] = await pool.query<JamOperasionalRow[]>(
      "SELECT hari, jam_buka, jam_tutup, aktif FROM jam_operasional ORDER BY id ASC"
    );

    if (!pengaturanRows[0]) {
      return null;
    }

    const merged: PengaturanSistemPayload = {
      namaInstansi: pengaturanRows[0].nama_instansi ?? defaultPengaturan.namaInstansi,
      alamatLengkap: pengaturanRows[0].alamat_lengkap ?? defaultPengaturan.alamatLengkap,
      nomorTelepon: pengaturanRows[0].nomor_telepon ?? defaultPengaturan.nomorTelepon,
      emailResmi: pengaturanRows[0].email_resmi ?? defaultPengaturan.emailResmi,
      logoUrl: pengaturanRows[0].logo_url ?? defaultPengaturan.logoUrl,
      jamOperasional: jamRows.length
        ? jamRows.map((row) => ({
            hari: row.hari,
            jam_buka: row.jam_buka,
            jam_tutup: row.jam_tutup,
            aktif: row.aktif === 1,
          }))
        : [...defaultPengaturan.jamOperasional],
      notifPanggilanAntrean: pengaturanRows[0].notif_panggilan_antrean === 1,
      notifPeringatanSistem: pengaturanRows[0].notif_peringatan_sistem === 1,
      volumeUtama: Number(pengaturanRows[0].volume_utama ?? defaultPengaturan.volumeUtama),
    };

    inMemoryPengaturan = merged;
    return merged;
  } catch (error) {
    console.warn("⚠️ Tabel pengaturan belum dibuat, memakai state in-memory.", error);
    return null;
  }
}

export async function getPengaturan(_req: Request, res: Response) {
  const fromDb = await loadFromDatabase();
  const payload = fromDb ?? inMemoryPengaturan;
  inMemoryPengaturan = payload;

  res.json({
    success: true,
    data: payload,
  });
}

export async function updatePengaturan(req: Request, res: Response) {
  const incoming = req.body as Partial<PengaturanSistemPayload> | undefined;
  const next = normalisasiPayload(incoming);
  inMemoryPengaturan = next;

  try {
    const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'pengaturan_sistem'");
    const [jamTables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'jam_operasional'");

    if (tables.length && jamTables.length) {
      const conn = await pool.getConnection();
      try {
        await conn.beginTransaction();

        const { namaInstansi, alamatLengkap, nomorTelepon, emailResmi, logoUrl, notifPanggilanAntrean, notifPeringatanSistem, volumeUtama } = next;

        await conn.query(
          `INSERT INTO pengaturan_sistem
            (nama_instansi, alamat_lengkap, nomor_telepon, email_resmi, logo_url, notif_panggilan_antrean, notif_peringatan_sistem, volume_utama, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          ON DUPLICATE KEY UPDATE
            nama_instansi = VALUES(nama_instansi),
            alamat_lengkap = VALUES(alamat_lengkap),
            nomor_telepon = VALUES(nomor_telepon),
            email_resmi = VALUES(email_resmi),
            logo_url = VALUES(logo_url),
            notif_panggilan_antrean = VALUES(notif_panggilan_antrean),
            notif_peringatan_sistem = VALUES(notif_peringatan_sistem),
            volume_utama = VALUES(volume_utama),
            updated_at = NOW()`,
          [
            namaInstansi,
            alamatLengkap,
            nomorTelepon,
            emailResmi,
            logoUrl,
            notifPanggilanAntrean ? 1 : 0,
            notifPeringatanSistem ? 1 : 0,
            volumeUtama,
          ]
        );

        await conn.query("DELETE FROM jam_operasional");

        if (next.jamOperasional.length > 0) {
          const values: unknown[] = [];
          const placeholders: string[] = [];

          next.jamOperasional.forEach((item) => {
            values.push(item.hari, item.jam_buka, item.jam_tutup, item.aktif ? 1 : 0);
            placeholders.push("(?, ?, ?, ?)");
          });

          await conn.query(
            `INSERT INTO jam_operasional (hari, jam_buka, jam_tutup, aktif) VALUES ${placeholders.join(", ")}`,
            values
          );
        }

        await conn.commit();
      } catch (dbError) {
        await conn.rollback();
        throw dbError;
      } finally {
        conn.release();
      }
    }
  } catch (error) {
    console.warn("⚠️ Simpan pengaturan ke MySQL gagal, tetap memakai state in-memory.", error);
  }

  res.json({
    success: true,
    data: next,
    message: "Pengaturan sistem berhasil diperbarui.",
  });
}
