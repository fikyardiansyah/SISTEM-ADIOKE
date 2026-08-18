import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Jangan bikin server langsung crash di sini (biar error-nya jelas dan
  // gampang di-debug), tapi tetap teriak keras di log kalau env belum diisi.
  console.warn(
    "⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum diisi di .env — endpoint auth tidak akan berfungsi."
  );
}

/**
 * Client Supabase pakai SERVICE ROLE KEY (bukan anon key) — HANYA dipakai
 * di backend, JANGAN PERNAH dikirim ke frontend. Dua kegunaan di sini:
 *  1. `auth.signInWithPassword` — proxy login (frontend kirim
 *     username/email+password ke Express, Express yang bicara ke Supabase).
 *  2. `auth.getUser(token)` — verifikasi access token yang dikirim
 *     frontend di header Authorization pada request-request selanjutnya.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});