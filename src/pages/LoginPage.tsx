import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Kredensial sementara (hardcode) — ganti/sambungkan ke API auth saat backend sudah tersedia
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const ADMIN_STORAGE_KEY = "adioke_admin_user";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ingatSaya, setIngatSaya] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setError("");
      localStorage.setItem(ADMIN_STORAGE_KEY, username);
      navigate("/admin/portal");
    } else {
      setError("Username atau password salah.");
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-slate-900 bg-cover bg-center p-4"
      style={{ backgroundImage: "url(/images/kantorcamat.jpg)" }}
    >
      {/* Overlay gelap tipis supaya kartu login tetap kontras di atas foto */}
      <div className="absolute inset-0 bg-blue-950/60" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
        {/* Panel kiri — branding Adi Oke */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-blue-900 p-10 text-white md:flex">
          {/* Dekorasi lingkaran, senada dengan hero di Navbar */}
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blue-800/60" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-blue-700/40" />
          <div className="pointer-events-none absolute right-10 top-1/3 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-10 w-10" />
            <div className="text-xs font-bold leading-tight">
              <p>KECAMATAN KUTA SELATAN</p>
              <p>KABUPATEN BADUNG</p>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col items-center justify-center text-center">
            <img src="/images/logo-adioke.png" alt="Adi Oke" className="h-28" />
            <p className="mt-3 text-sm text-blue-100">Antrean Digital Online Kuta Selatan</p>

            <h2 className="mt-10 text-2xl font-bold leading-snug">
              Antrean Lebih Mudah,
              <br />
              Pelayanan Lebih Cepat.
            </h2>
            <p className="mt-3 max-w-xs text-sm text-blue-100">
              Kelola dan pantau seluruh loket layanan kecamatan dalam satu portal admin.
            </p>
          </div>

          <p className="relative text-xs text-blue-200">© 2023 Kecamatan Kuta Selatan</p>
        </div>

        {/* Panel kanan — form login */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
          <div className="mx-auto flex items-center gap-2 md:hidden">
            <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-9 w-9" />
            <span className="text-xs font-bold leading-tight">
              KECAMATAN KUTA SELATAN
              <br />
              KABUPATEN BADUNG
            </span>
          </div>

          <h1 className="mt-6 text-xl font-bold text-gray-900 md:mt-0">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-gray-500">Silakan masuk ke akun admin Anda</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoFocus
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-11 text-sm text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.5A9.9 9.9 0 0112 5c5 0 9 4 10.4 7-.5 1.1-1.3 2.4-2.4 3.5M6.1 6.6C3.9 8 2.4 10 1.6 12c1.4 3 5.4 7 10.4 7 1.2 0 2.4-.2 3.5-.6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M1.6 12S5.6 5 12 5s10.4 7 10.4 7-4 7-10.4 7S1.6 12 1.6 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={ingatSaya}
                onChange={(e) => setIngatSaya(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
              />
              Ingat saya
            </label>

            {error && <p className="text-sm font-medium text-red-500">{error}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-blue-800 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-900"
            >
              Masuk
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link to="/" className="font-semibold text-blue-700 hover:underline">
              ← Kembali ke Beranda
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}