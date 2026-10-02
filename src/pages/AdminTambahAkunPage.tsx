import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../context/useQueue";
import type { PeranAkun } from "../context/QueueContext";
import { buatAkun } from "../lib/users";

const PERAN_OPSI: PeranAkun[] = ["Super Admin", "Admin", "Petugas"];

function IconEye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconEyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.6 5.1A9.9 9.9 0 0 1 12 5c6 0 9.5 7 9.5 7a17.6 17.6 0 0 1-3.1 4.1M6.6 6.6C4 8.3 2.5 12 2.5 12S6 19 12 19a10 10 0 0 0 3.4-.6M9.5 9.5a3 3 0 0 0 4.2 4.2"
      />
    </svg>
  );
}
function IconUserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path strokeLinecap="round" d="M19 8v6M22 11h-6" />
    </svg>
  );
}
function IconSave(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

export default function AdminTambahAkunPage() {
  const navigate = useNavigate();
  const { layananList } = useQueue();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [peran, setPeran] = useState<PeranAkun | "">("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [statusAktif, setStatusAktif] = useState(true);
  const [error, setError] = useState("");
  const [loketId, setLoketId] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim() || !email.trim() || !username.trim() || !peran) {
      setError("Nama, email, username, dan peran wajib diisi.");
      return;
    }
    if (peran === "Petugas" && !loketId) {
      setError("Pilih loket tugas untuk akun Petugas.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== konfirmasiPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setMenyimpan(true);
    try {
      await buatAkun({
        nama: nama.trim(),
        email: email.trim(),
        username: username.trim(),
        peran,
        status: statusAktif ? "Aktif" : "Tidak Aktif",
        loketId: peran === "Petugas" ? loketId : null,
        password,
      });
      navigate("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Akun gagal dibuat.");
    } finally {
      setMenyimpan(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-1 text-sm text-gray-400">
        Kelola Akun <span className="mx-1">›</span>
        <span className="font-medium text-gray-600">Tambah Akun</span>
      </p>

      <h1 className="text-3xl font-extrabold text-gray-900">Tambah Akun</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Buat akun baru untuk memberikan akses ke portal admin.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IconUserPlus className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-bold text-gray-900">Informasi Akun</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Alamat Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {peran === "Petugas" && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Loket Tugas</label>
            <select
              value={loketId}
              onChange={(e) => setLoketId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Pilih satu loket</option>
              {layananList.map((item) => <option key={item.id} value={item.id}>{item.namaLoket}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s+/g, "").toLowerCase())}
              placeholder="Pilih username unik"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Peran</label>
            <select
              value={peran}
              onChange={(e) => setPeran(e.target.value as PeranAkun)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                Pilih peran pengguna
              </option>
              {PERAN_OPSI.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <IconEyeOff className="h-4.5 w-4.5" /> : <IconEye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showKonfirmasi ? "text" : "password"}
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKonfirmasi((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showKonfirmasi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showKonfirmasi ? <IconEyeOff className="h-4.5 w-4.5" /> : <IconEye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Status akun */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-5">
          <div>
            <p className="font-bold text-gray-900">Status Akun</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Tentukan apakah akun ini aktif dan dapat digunakan untuk login.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={statusAktif}
            onClick={() => setStatusAktif((v) => !v)}
            className={`flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold transition ${
              statusAktif ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}
          >
            <span className="h-6 w-6 rounded-full bg-white shadow" />
            {statusAktif ? "Aktif" : "Tidak Aktif"}
          </button>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={menyimpan}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
          >
            <IconSave className="h-4 w-4" />
            {menyimpan ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}