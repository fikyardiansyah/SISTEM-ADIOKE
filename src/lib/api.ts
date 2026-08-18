// Alamat backend Express. Bisa dioverride lewat file .env di root frontend
// (VITE_API_URL=http://localhost:5000/api) kalau nanti backend dipindah
// host/port-nya — tanpa perlu ubah kode di sini.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Helper fetch generik — semua controller backend (AuthController,
 * LayananController, AntrianController, dst) selalu balas dengan bentuk
 * `{ success, message?, data? }`, jadi cukup satu fungsi ini yang
 * membongkarnya, dipakai di semua tempat.
 *
 * `token` opsional: kalau diisi, otomatis dipasang sebagai
 * `Authorization: Bearer <token>` — dipakai nanti untuk endpoint yang
 * butuh login admin (requireAuth di backend).
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Endpoint 500/404 di backend tetap balas JSON (lihat error handler di
  // app.ts), tapi jaga-jaga kalau responsnya bukan JSON sama sekali.
  const body = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!res.ok || !body?.success) {
    throw new Error(body?.message ?? `Permintaan gagal (${res.status})`);
  }

  return body.data as T;
}