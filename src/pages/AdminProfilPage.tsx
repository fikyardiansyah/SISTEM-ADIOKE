import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

const ADMIN_STORAGE_KEY = "adioke_admin_user";
const KEY_NAMA = "adioke_admin_nama_lengkap";
const KEY_NIP = "adioke_admin_nip";
const KEY_EMAIL = "adioke_admin_email";
const KEY_TELEPON = "adioke_admin_telepon";
const KEY_FOTO = "adioke_admin_foto";
const KEY_NOTIF_EMAIL = "adioke_admin_notif_email";
const KEY_NOTIF_BROWSER = "adioke_admin_notif_browser";
const KEY_BAHASA = "adioke_admin_bahasa";
const KEY_2FA = "adioke_admin_2fa";

function inisial(nama: string) {
  return nama
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function bacaBoolean(key: string, fallback: boolean) {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === "true";
}

export default function AdminProfilPage() {
  const username = localStorage.getItem(ADMIN_STORAGE_KEY) ?? "admin";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Informasi Pribadi ----
  const [namaLengkap, setNamaLengkap] = useState(
    () => localStorage.getItem(KEY_NAMA) ?? "Administrator"
  );
  const [nip, setNip] = useState(() => localStorage.getItem(KEY_NIP) ?? "");
  const [email, setEmail] = useState(() => localStorage.getItem(KEY_EMAIL) ?? "");
  const [telepon, setTelepon] = useState(() => localStorage.getItem(KEY_TELEPON) ?? "");
  const [foto, setFoto] = useState<string | null>(() => localStorage.getItem(KEY_FOTO));
  const [tersimpanProfil, setTersimpanProfil] = useState(false);

  // ---- Keamanan ----
  const [kataSandiLama, setKataSandiLama] = useState("");
  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [konfirmasiSandi, setKonfirmasiSandi] = useState("");
  const [errorSandi, setErrorSandi] = useState("");
  const [suksesSandi, setSuksesSandi] = useState(false);
  const [twoFA, setTwoFA] = useState(() => bacaBoolean(KEY_2FA, false));

  // ---- Preferensi ----
  const [notifEmail, setNotifEmail] = useState(() => bacaBoolean(KEY_NOTIF_EMAIL, true));
  const [notifBrowser, setNotifBrowser] = useState(() => bacaBoolean(KEY_NOTIF_BROWSER, false));
  const [bahasa, setBahasa] = useState(() => localStorage.getItem(KEY_BAHASA) ?? "id");

  const handlePilihFoto = () => fileInputRef.current?.click();

  const handleFotoBerubah = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFoto(url);
    // NOTE: preview lokal saja (object URL) — hilang lagi setelah refresh
    // karena belum ada tempat penyimpanan file (backend/storage) yang
    // sesungguhnya.
  };

  const handleSimpanProfil = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem(KEY_NAMA, namaLengkap.trim() || "Administrator");
    localStorage.setItem(KEY_NIP, nip.trim());
    localStorage.setItem(KEY_EMAIL, email.trim());
    localStorage.setItem(KEY_TELEPON, telepon.trim());
    if (foto) localStorage.setItem(KEY_FOTO, foto);
    setTersimpanProfil(true);
    setTimeout(() => setTersimpanProfil(false), 2500);
  };

  const handleGantiSandi = (e: FormEvent) => {
    e.preventDefault();
    setErrorSandi("");
    setSuksesSandi(false);

    if (!kataSandiLama) {
      setErrorSandi("Masukkan kata sandi saat ini.");
      return;
    }
    if (kataSandiBaru.length < 8) {
      setErrorSandi("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (kataSandiBaru !== konfirmasiSandi) {
      setErrorSandi("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    // Catatan: sistem ini belum punya backend autentikasi sungguhan (login
    // masih 1 akun hardcode), jadi kata sandi baru di sini HANYA divalidasi
    // dan tidak benar-benar mengubah kredensial login.
    setKataSandiLama("");
    setKataSandiBaru("");
    setKonfirmasiSandi("");
    setSuksesSandi(true);
    setTimeout(() => setSuksesSandi(false), 3000);
  };

  const handleToggle2FA = () => {
    const next = !twoFA;
    setTwoFA(next);
    localStorage.setItem(KEY_2FA, String(next));
  };

  const handleToggleNotifEmail = () => {
    const next = !notifEmail;
    setNotifEmail(next);
    localStorage.setItem(KEY_NOTIF_EMAIL, String(next));
  };

  const handleToggleNotifBrowser = () => {
    const next = !notifBrowser;
    setNotifBrowser(next);
    localStorage.setItem(KEY_NOTIF_BROWSER, String(next));
  };

  const handleUbahBahasa = (e: ChangeEvent<HTMLSelectElement>) => {
    setBahasa(e.target.value);
    localStorage.setItem(KEY_BAHASA, e.target.value);
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <p className="text-sm text-gray-400">
          Account <span className="mx-1">›</span> Profil Saya
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
      </div>

      {/* Kartu identitas */}
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row">
        <div className="relative shrink-0">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-xl font-bold text-white">
            {foto ? (
              <img src={foto} alt={namaLengkap} className="h-full w-full object-cover" />
            ) : (
              inisial(namaLengkap)
            )}
          </div>
          <button
            type="button"
            onClick={handlePilihFoto}
            title="Ganti foto"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow ring-2 ring-white transition hover:bg-blue-700"
          >
            <IconPencil className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFotoBerubah}
            className="hidden"
          />
        </div>

        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <p className="text-lg font-bold text-gray-900">{namaLengkap}</p>
            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <IconShieldCheck className="h-3.5 w-3.5" />
              Verified
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Super Admin <span className="text-gray-400">· @{username}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom kiri: Informasi Pribadi + Preferensi */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <form onSubmit={handleSimpanProfil} className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <IconIdCard className="h-5 w-5 text-blue-600" />
              Informasi Pribadi
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="belum diisi"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@adioke.go.id"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-600">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={telepon}
                  onChange={(e) => setTelepon(e.target.value)}
                  placeholder="+62 8xx-xxxx-xxxx"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {tersimpanProfil && (
                <span className="text-sm font-medium text-green-600">Profil disimpan.</span>
              )}
              <button
                type="submit"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>

          {/* Preferensi */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
              <IconSliders className="h-5 w-5 text-blue-600" />
              Preferensi
            </h2>

            <p className="mb-2 text-sm font-semibold text-gray-800">Pengaturan Notifikasi</p>
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <IconMail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email Notifikasi</p>
                    <p className="text-xs text-gray-500">Terima update aktivitas via email</p>
                  </div>
                </div>
                <Toggle checked={notifEmail} onChange={handleToggleNotifEmail} />
              </div>

              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <IconBellRing className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Notifikasi Browser</p>
                    <p className="text-xs text-gray-500">Tampilkan pop-up di browser</p>
                  </div>
                </div>
                <Toggle checked={notifBrowser} onChange={handleToggleNotifBrowser} />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                Bahasa Interface
              </label>
              <select
                value={bahasa}
                onChange={handleUbahBahasa}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (segera hadir)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kolom kanan: Keamanan */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
            <IconShield className="h-5 w-5 text-blue-600" />
            Keamanan
          </h2>

          <form onSubmit={handleGantiSandi} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Password Saat Ini
              </label>
              <input
                type="password"
                value={kataSandiLama}
                onChange={(e) => setKataSandiLama(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Password Baru
              </label>
              <input
                type="password"
                value={kataSandiBaru}
                onChange={(e) => setKataSandiBaru(e.target.value)}
                placeholder="Masukkan password baru"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                Konfirmasi Password Baru
              </label>
              <input
                type="password"
                value={konfirmasiSandi}
                onChange={(e) => setKonfirmasiSandi(e.target.value)}
                placeholder="Ketik ulang password baru"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {errorSandi && <p className="text-sm font-medium text-red-500">{errorSandi}</p>}
            {suksesSandi && (
              <p className="text-sm font-medium text-green-600">Kata sandi berhasil diperbarui.</p>
            )}

            <button
              type="submit"
              className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Perbarui Password
            </button>
          </form>

          <div className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <IconShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Tingkatkan keamanan akun Anda.</p>
              </div>
            </div>
            <Toggle checked={twoFA} onChange={handleToggle2FA} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Toggle switch kecil                                                    */
/* ---------------------------------------------------------------------- */

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/* Icon kecil (outline, currentColor)                                     */
/* ---------------------------------------------------------------------- */

function IconPencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"
      />
    </svg>
  );
}

function IconIdCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="12" r="2" />
      <path strokeLinecap="round" d="M6 16.5c.5-1.5 1.8-2.5 2.5-2.5s2 1 2.5 2.5M14 9h5M14 12.5h5M14 16h3.5" />
    </svg>
  );
}

function IconSliders({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h13M21 18h-0" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  );
}

function IconMail({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 7 8 6 8-6" />
    </svg>
  );
}

function IconBellRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path strokeLinecap="round" d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v6c0 4.5 3.2 7.7 7.5 9 4.3-1.3 7.5-4.5 7.5-9V6L12 3Z" />
    </svg>
  );
}

function IconShieldCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4.5 6v6c0 4.5 3.2 7.7 7.5 9 4.3-1.3 7.5-4.5 7.5-9V6L12 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
    </svg>
  );
}