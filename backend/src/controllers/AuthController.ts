import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db.js";
import { supabaseAdmin } from "../config/supabaseClient.js";
import type { UserRow } from "../types/models.js";

/**
 * POST /api/auth/login
 *
 * Alur: frontend kirim { usernameOrEmail, password } ke sini (bukan
 * langsung ke Supabase), supaya frontend tidak perlu tahu apa-apa soal
 * Supabase sama sekali — cukup bicara ke backend sendiri, seperti API
 * biasa. Di baliknya:
 *   1. Kalau yang dikirim bukan email (tidak ada "@"), cari email-nya
 *      dulu di tabel `users` MySQL berdasarkan kolom `username`.
 *   2. Login sungguhan (cek password) dilakukan Supabase lewat
 *      `signInWithPassword` — backend TIDAK menyimpan/membandingkan
 *      password sendiri.
 *   3. Kalau berhasil, ambil profil (nama, peran, status) dari MySQL
 *      berdasarkan `supabase_uid` yang cocok dengan `user.id` dari
 *      Supabase, lalu kembalikan access token + profil itu ke frontend.
 */
export async function login(req: Request, res: Response) {
  const { usernameOrEmail, password } = req.body as {
    usernameOrEmail?: string;
    password?: string;
  };

  if (!usernameOrEmail?.trim() || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username/email dan password wajib diisi." });
  }

  let email = usernameOrEmail.trim();

  // Kalau yang diketik bukan email, anggap itu username -> cari email-nya di MySQL
  if (!email.includes("@")) {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT email FROM users WHERE username = ? LIMIT 1",
      [email]
    );
    if (!rows[0]) {
      return res.status(401).json({ success: false, message: "Username atau password salah." });
    }
    email = rows[0].email;
  }

  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error || !data.session || !data.user) {
    // BARIS SEMENTARA buat debug — lihat pesan asli dari Supabase di terminal
    // backend. Hapus lagi kalau sudah ketemu penyebabnya & login berhasil.
    console.error("❌ Supabase signInWithPassword gagal:", {
      email,
      errorMessage: error?.message,
      errorStatus: error?.status,
    });
    return res.status(401).json({ success: false, message: "Username atau password salah." });
  }

  const [profileRows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE supabase_uid = ? LIMIT 1",
    [data.user.id]
  );
  const profil = profileRows[0];

  if (!profil) {
    // Akun ada di Supabase tapi belum pernah ditautkan ke profil di MySQL
    // (mis. admin baru dibuat di Supabase Dashboard tapi lupa didaftarkan
    // lewat "Tambah Akun"). Tolak login supaya tidak ada admin "hantu"
    // tanpa peran/status yang jelas.
    return res.status(403).json({
      success: false,
      message: "Akun ini belum terhubung ke profil admin. Hubungi Super Admin.",
    });
  }

  if (profil.status !== "Aktif") {
    return res.status(403).json({ success: false, message: "Akun ini tidak aktif. Hubungi Super Admin." });
  }

  await pool.query("UPDATE users SET login_terakhir = NOW() WHERE id = ?", [profil.id]);

  res.json({
    success: true,
    data: {
      // Access token dari Supabase inilah yang dipakai frontend sebagai
      // Bearer token untuk semua request selanjutnya ke API ini.
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: profil.id,
        nama: profil.nama,
        email: profil.email,
        username: profil.username,
        peran: profil.peran,
        loketId: profil.loket_id,
      },
    },
  });
}

/** GET /api/auth/me — cek siapa yang sedang login berdasarkan token (dipakai frontend saat refresh halaman) */
export async function me(req: Request, res: Response) {
  // req.user diisi requireAuth (AuthMiddleware.ts) setelah token Supabase
  // diverifikasi DAN profil MySQL-nya ditemukan — jadi di sini tinggal
  // pakai req.user.id, tidak perlu verifikasi ulang.
  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, nama, email, username, peran, loket_id, status FROM users WHERE id = ? LIMIT 1",
    [req.user!.id]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  res.json({ success: true, data: user });
}

export async function getProfile(req: Request, res: Response) {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT nama, email, username, peran, nip, nomor_telepon, foto_profil FROM users WHERE id = ? LIMIT 1",
    [req.user!.id]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  res.json({
    success: true,
    data: {
      nama: user.nama,
      email: user.email,
      username: user.username,
      peran: user.peran,
      nip: user.nip,
      nomorTelepon: user.nomor_telepon,
      fotoProfil: user.foto_profil,
    },
  });
}

export async function updateProfile(req: Request, res: Response) {
  const payload = req.body as {
    nama?: unknown;
    email?: unknown;
    nip?: unknown;
    nomorTelepon?: unknown;
    fotoProfil?: unknown;
  };
  const nama = typeof payload.nama === "string" ? payload.nama.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const nip = typeof payload.nip === "string" ? payload.nip.trim() : "";
  const nomorTelepon = typeof payload.nomorTelepon === "string" ? payload.nomorTelepon.trim() : "";
  const fotoProfil = payload.fotoProfil;

  if (!nama || nama.length > 150) {
    return res.status(400).json({ success: false, message: "Nama wajib diisi dan maksimal 150 karakter." });
  }
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: "Format email tidak valid." });
  }
  if (nip.length > 30 || nomorTelepon.length > 30) {
    return res.status(400).json({ success: false, message: "NIP dan nomor telepon maksimal 30 karakter." });
  }
  if (
    fotoProfil !== undefined &&
    fotoProfil !== null &&
    (typeof fotoProfil !== "string" ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(fotoProfil) ||
      Buffer.byteLength(fotoProfil, "utf8") > 700_000)
  ) {
    return res.status(400).json({ success: false, message: "Foto profil tidak valid atau terlalu besar. Pilih ulang foto." });
  }

  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, supabase_uid, email, foto_profil FROM users WHERE id = ? LIMIT 1",
    [req.user!.id]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });

  if (email !== user.email) {
    const [duplicate] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, user.id]
    );
    if (duplicate.length) return res.status(409).json({ success: false, message: "Email sudah digunakan akun lain." });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabase_uid, {
      email,
      email_confirm: true,
      user_metadata: { nama },
    });
    if (error) return res.status(400).json({ success: false, message: error.message });
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabase_uid, {
      user_metadata: { nama },
    });
    if (error) return res.status(400).json({ success: false, message: error.message });
  }

  await pool.query(
    `UPDATE users
     SET nama = ?, email = ?, nip = ?, nomor_telepon = ?, foto_profil = ?
     WHERE id = ?`,
    [
      nama,
      email,
      nip || null,
      nomorTelepon || null,
      fotoProfil === undefined ? user.foto_profil : fotoProfil,
      user.id,
    ]
  );

  res.json({
    success: true,
    message: "Profil berhasil diperbarui.",
    data: {
      nama,
      email,
      username: req.user!.username,
      peran: req.user!.peran,
      nip: nip || null,
      nomorTelepon: nomorTelepon || null,
      fotoProfil: fotoProfil === undefined ? user.foto_profil : fotoProfil,
    },
  });
}

export async function changePassword(req: Request, res: Response) {
  const payload = req.body as { passwordSaatIni?: unknown; passwordBaru?: unknown };
  if (typeof payload.passwordSaatIni !== "string" || !payload.passwordSaatIni) {
    return res.status(400).json({ success: false, message: "Password saat ini wajib diisi." });
  }
  if (typeof payload.passwordBaru !== "string" || payload.passwordBaru.length < 8) {
    return res.status(400).json({ success: false, message: "Password baru minimal 8 karakter." });
  }

  const [rows] = await pool.query<UserRow[]>(
    "SELECT supabase_uid, email FROM users WHERE id = ? LIMIT 1",
    [req.user!.id]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });

  const { error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
    email: user.email,
    password: payload.passwordSaatIni,
  });
  if (verifyError) return res.status(400).json({ success: false, message: "Password saat ini tidak sesuai." });

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.supabase_uid, {
    password: payload.passwordBaru,
  });
  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Password berhasil diperbarui." });
}