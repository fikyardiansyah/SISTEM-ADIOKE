import type { Request, Response } from "express";
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
    "SELECT id, nama, email, username, peran, status FROM users WHERE id = ? LIMIT 1",
    [req.user!.id]
  );
  const user = rows[0];
  if (!user) return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  res.json({ success: true, data: user });
}