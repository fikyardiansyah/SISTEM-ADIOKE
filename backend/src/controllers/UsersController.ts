import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";
import { pool } from "../config/db.js";
import { supabaseAdmin } from "../config/supabaseClient.js";
import type { PeranAkun, StatusAkun, UserRow } from "../types/models.js";

const peranValid: PeranAkun[] = ["Super Admin", "Admin", "Petugas"];
const statusValid: StatusAkun[] = ["Aktif", "Tidak Aktif"];

interface UserPayload {
  nama?: string;
  email?: string;
  username?: string;
  peran?: PeranAkun;
  status?: StatusAkun;
  loketId?: string | null;
  password?: string;
}

function validasiAkun(payload: UserPayload) {
  if (!payload.nama?.trim() || !payload.email?.trim() || !payload.username?.trim()) {
    return "Nama, email, dan username wajib diisi.";
  }
  if (!payload.email.includes("@")) return "Format email tidak valid.";
  if (!payload.peran || !peranValid.includes(payload.peran)) return "Peran tidak valid.";
  if (!payload.status || !statusValid.includes(payload.status)) return "Status akun tidak valid.";
  if (payload.peran === "Petugas" && !payload.loketId) return "Petugas wajib ditugaskan ke satu loket.";
  return null;
}

async function validasiLoket(peran: PeranAkun, loketId: string | null | undefined) {
  if (peran !== "Petugas") return null;
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id FROM layanan WHERE id = ? LIMIT 1", [loketId]);
  return rows.length ? null : "Loket yang dipilih tidak ditemukan.";
}

export async function getUsers(_req: Request, res: Response) {
  const [rows] = await pool.query<UserRow[]>(
    `SELECT u.id, u.nama, u.email, u.username, u.peran, u.status, u.loket_id,
            u.login_terakhir, l.nama AS nama_loket
     FROM users u LEFT JOIN layanan l ON l.id = u.loket_id
     ORDER BY u.created_at ASC`
  );
  res.json({ success: true, data: rows });
}

export async function createUser(req: Request, res: Response) {
  const payload = req.body as UserPayload;
  const validationError = validasiAkun(payload);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  if (!payload.password || payload.password.length < 8) {
    return res.status(400).json({ success: false, message: "Kata sandi minimal 8 karakter." });
  }

  const loketError = await validasiLoket(payload.peran!, payload.loketId);
  if (loketError) return res.status(400).json({ success: false, message: loketError });

  const [existing] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [payload.email!.trim(), payload.username!.trim()]
  );
  if (existing.length) return res.status(409).json({ success: false, message: "Email atau username sudah digunakan." });

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: payload.email!.trim(),
    password: payload.password,
    email_confirm: true,
    user_metadata: { nama: payload.nama!.trim() },
  });
  if (error || !data.user) {
    return res.status(400).json({ success: false, message: error?.message ?? "Akun Supabase gagal dibuat." });
  }

  try {
    await pool.query(
      `INSERT INTO users (id, supabase_uid, nama, email, username, peran, loket_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(), data.user.id, payload.nama!.trim(), payload.email!.trim(), payload.username!.trim(),
        payload.peran, payload.peran === "Petugas" ? payload.loketId : null, payload.status,
      ]
    );
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw error;
  }

  res.status(201).json({ success: true, message: "Akun berhasil dibuat." });
}

export async function updateUser(req: Request, res: Response) {
  const payload = req.body as UserPayload;
  const validationError = validasiAkun(payload);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  if (payload.password && payload.password.length < 8) {
    return res.status(400).json({ success: false, message: "Kata sandi minimal 8 karakter." });
  }

  const loketError = await validasiLoket(payload.peran!, payload.loketId);
  if (loketError) return res.status(400).json({ success: false, message: loketError });

  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  if (user.id === req.user?.id && (payload.peran !== user.peran || payload.status !== user.status)) {
    return res.status(400).json({ success: false, message: "Role atau status akun yang sedang digunakan tidak dapat diubah." });
  }

  const [duplicate] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE (email = ? OR username = ?) AND id <> ? LIMIT 1",
    [payload.email!.trim(), payload.username!.trim(), user.id]
  );
  if (duplicate.length) return res.status(409).json({ success: false, message: "Email atau username sudah digunakan." });

  const authUpdate: { email?: string; password?: string; email_confirm?: boolean } = {};
  if (payload.email!.trim() !== user.email) {
    authUpdate.email = payload.email!.trim();
    authUpdate.email_confirm = true;
  }
  if (payload.password) authUpdate.password = payload.password;
  if (Object.keys(authUpdate).length) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabase_uid, authUpdate);
    if (error) return res.status(400).json({ success: false, message: error.message });
  }

  await pool.query(
    `UPDATE users SET nama = ?, email = ?, username = ?, peran = ?, loket_id = ?, status = ? WHERE id = ?`,
    [
      payload.nama!.trim(), payload.email!.trim(), payload.username!.trim(), payload.peran,
      payload.peran === "Petugas" ? payload.loketId : null, payload.status, user.id,
    ]
  );
  res.json({ success: true, message: "Akun berhasil diperbarui." });
}

export async function deleteUser(req: Request, res: Response) {
  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  if (user.id === req.user?.id) return res.status(400).json({ success: false, message: "Akun yang sedang digunakan tidak dapat dihapus." });

  if (user.peran === "Super Admin" && user.status === "Aktif") {
    const [counts] = await pool.query<(RowDataPacket & { total: number })[]>(
      "SELECT COUNT(*) AS total FROM users WHERE peran = 'Super Admin' AND status = 'Aktif' AND id <> ?",
      [user.id]
    );
    if (Number(counts[0]?.total ?? 0) === 0) {
      return res.status(409).json({ success: false, message: "Super Admin aktif terakhir tidak dapat dihapus." });
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.supabase_uid);
  if (error) return res.status(400).json({ success: false, message: error.message });
  await pool.query("DELETE FROM users WHERE id = ?", [user.id]);
  res.json({ success: true, message: "Akun berhasil dihapus." });
}