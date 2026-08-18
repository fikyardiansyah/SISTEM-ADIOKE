import type { Request, Response, NextFunction } from "express";
import { pool } from "../config/db.js";
import { supabaseAdmin } from "../config/supabaseClient.js";
import type { UserRow } from "../types/models.js";

export interface AuthPayload {
  id: string; // id profil di MySQL (bukan supabase_uid)
  supabaseUid: string;
  username: string;
  peran: string;
}

// Perluas tipe Request Express supaya req.user dikenali TypeScript di controller
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Pasang middleware ini di route yang cuma boleh diakses admin yang sudah
 * login. Bedanya dengan versi JWT-lokal sebelumnya: token di sini adalah
 * access token ASLI dari Supabase, jadi verifikasinya lewat
 * `supabaseAdmin.auth.getUser(token)` (Supabase yang cek tanda tangan +
 * kedaluwarsa), bukan `jwt.verify` pakai secret kita sendiri.
 *
 * Setelah token valid, profil admin (peran/status) tetap diambil dari
 * MySQL berdasarkan `supabase_uid`, karena itu satu-satunya sumber
 * kebenaran untuk peran & status aktif/nonaktif di sistem ini.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan. Silakan login." });
  }

  const token = header.slice("Bearer ".length);

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, message: "Token tidak valid atau sudah kedaluwarsa." });
  }

  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, username, peran, status FROM users WHERE supabase_uid = ? LIMIT 1",
    [data.user.id]
  );
  const profil = rows[0];

  if (!profil) {
    return res.status(403).json({
      success: false,
      message: "Akun ini belum terhubung ke profil admin. Hubungi Super Admin.",
    });
  }
  if (profil.status !== "Aktif") {
    return res.status(403).json({ success: false, message: "Akun ini tidak aktif. Hubungi Super Admin." });
  }

  req.user = {
    id: profil.id,
    supabaseUid: data.user.id,
    username: profil.username,
    peran: profil.peran,
  };
  next();
}

/** Pasang SETELAH requireAuth, untuk route yang cuma boleh peran tertentu.
 *  Contoh: requireRole("Super Admin") — hanya Super Admin yang boleh lewat. */
export function requireRole(...peranDiizinkan: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !peranDiizinkan.includes(req.user.peran)) {
      return res.status(403).json({ success: false, message: "Anda tidak punya akses untuk aksi ini." });
    }
    next();
  };
}