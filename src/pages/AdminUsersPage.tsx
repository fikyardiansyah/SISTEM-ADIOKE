import { useMemo, useState, type FormEvent, type SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../context/useQueue";
import type { AkunAdmin, PeranAkun, StatusAkun, TambahAkunInput } from "../context/QueueContext";

type IconProps = SVGProps<SVGSVGElement>;
const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconUsers(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.5 20c.2-2.6 1.9-4.6 4-5.2" />
    </svg>
  );
}
function IconShield(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </svg>
  );
}
function IconHeadset(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M20 19v1a3 3 0 0 1-3 3h-3" />
    </svg>
  );
}
function IconPlus(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconPencil(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function IconTrash(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v12.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V7h10Z" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
function IconSearch(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function IconClose(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function inisial(nama: string) {
  return nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatLoginTerakhir(ts: number | null): string {
  if (ts === null) return "Belum pernah";
  const now = new Date();
  const d = new Date(ts);
  const sameDay = d.toDateString() === now.toDateString();
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Hari ini, ${jam}`;

  const kemarin = new Date(now);
  kemarin.setDate(kemarin.getDate() - 1);
  if (d.toDateString() === kemarin.toDateString()) return `Kemarin, ${jam}`;

  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function BadgePeran({ peran }: { peran: PeranAkun }) {
  const cls =
    peran === "Super Admin"
      ? "bg-gray-900 text-white"
      : peran === "Admin"
      ? "bg-blue-600 text-white"
      : "border border-gray-300 text-gray-600";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{peran}</span>;
}

function BadgeStatus({ status }: { status: StatusAkun }) {
  const aktif = status === "Aktif";
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600">
      <span className={`h-2 w-2 rounded-full ${aktif ? "bg-green-500" : "bg-gray-300"}`} />
      {status}
    </span>
  );
}

const PERAN_OPSI: PeranAkun[] = ["Super Admin", "Admin", "Petugas"];
const STATUS_OPSI: StatusAkun[] = ["Aktif", "Tidak Aktif"];
const PAGE_SIZE = 8;

interface AkunModalProps {
  awal?: AkunAdmin;
  onClose: () => void;
  onSubmit: (data: TambahAkunInput) => void;
}

function AkunModal({ awal, onClose, onSubmit }: AkunModalProps) {
  const [nama, setNama] = useState(awal?.nama ?? "");
  const [email, setEmail] = useState(awal?.email ?? "");
  const [username, setUsername] = useState(awal?.username ?? "");
  const [peran, setPeran] = useState<PeranAkun>(awal?.peran ?? "Petugas");
  const [status, setStatus] = useState<StatusAkun>(awal?.status ?? "Aktif");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim() || !username.trim()) return;
    onSubmit({ nama: nama.trim(), email: email.trim(), username: username.trim(), peran, status });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {awal ? "Edit Akun" : "Tambah Akun"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Tutup"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kutaselatan.go.id"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username unik"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Peran</label>
            <select
              value={peran}
              onChange={(e) => setPeran(e.target.value as PeranAkun)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {PERAN_OPSI.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusAkun)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {STATUS_OPSI.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {awal ? "Simpan Perubahan" : "Tambah Akun"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const { akunList, updateAkun, hapusAkun } = useQueue();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [akunDiedit, setAkunDiedit] = useState<AkunAdmin | null>(null);

  const totalPengguna = akunList.length;
  const adminAktif = akunList.filter(
    (a) => (a.peran === "Admin" || a.peran === "Super Admin") && a.status === "Aktif"
  ).length;
  const petugasOnline = akunList.filter((a) => a.peran === "Petugas" && a.status === "Aktif").length;

  const hasilFilter = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return akunList;
    return akunList.filter(
      (a) => a.nama.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
  }, [akunList, search]);

  const totalHalaman = Math.max(1, Math.ceil(hasilFilter.length / PAGE_SIZE));
  const halamanAman = Math.min(page, totalHalaman);
  const akunDitampilkan = hasilFilter.slice(
    (halamanAman - 1) * PAGE_SIZE,
    halamanAman * PAGE_SIZE
  );

  const handleEdit = (data: TambahAkunInput) => {
    if (!akunDiedit) return;
    updateAkun(akunDiedit.id, data);
    setAkunDiedit(null);
  };

  const handleHapus = (akun: AkunAdmin) => {
    const yakin = window.confirm(`Hapus akun "${akun.nama}" (${akun.email})?`);
    if (yakin) hapusAkun(akun.id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Akun</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola akses pengguna, peran, dan status sistem.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/users/tambah")}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <IconPlus className="h-4 w-4" />
          Tambah Akun
        </button>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <IconUsers className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Total Pengguna
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalPengguna}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <IconShield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Admin Aktif
            </p>
            <p className="text-2xl font-bold text-gray-900">{adminAktif}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <IconHeadset className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Petugas Online
            </p>
            <p className="text-2xl font-bold text-gray-900">{petugasOnline}</p>
          </div>
        </div>
      </div>

      {/* Daftar akun */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-900">Daftar Akun</h2>
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari akun..."
              className="w-56 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {akunDitampilkan.length === 0 ? (
          <p className="py-14 text-center text-sm text-gray-400">Tidak ada akun yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-2 pr-4 font-medium">Nama Pengguna</th>
                  <th className="py-2 pr-4 font-medium">Peran</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Login Terakhir</th>
                  <th className="py-2 pr-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {akunDitampilkan.map((akun) => (
                  <tr key={akun.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                          {inisial(akun.nama)}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{akun.nama}</p>
                          <p className="text-xs text-gray-400">{akun.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <BadgePeran peran={akun.peran} />
                    </td>
                    <td className="py-3 pr-4">
                      <BadgeStatus status={akun.status} />
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatLoginTerakhir(akun.loginTerakhir)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAkunDiedit(akun)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Edit akun ${akun.nama}`}
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapus(akun)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus akun ${akun.nama}`}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {hasilFilter.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
            <p>
              Menampilkan {(halamanAman - 1) * PAGE_SIZE + 1}-
              {Math.min(halamanAman * PAGE_SIZE, hasilFilter.length)} dari {hasilFilter.length} akun
            </p>
            {totalHalaman > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={halamanAman === 1}
                  className="rounded-lg px-3 py-1.5 font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                      n === halamanAman
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalHalaman, p + 1))}
                  disabled={halamanAman === totalHalaman}
                  className="rounded-lg px-3 py-1.5 font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {akunDiedit && (
        <AkunModal awal={akunDiedit} onClose={() => setAkunDiedit(null)} onSubmit={handleEdit} />
      )}
    </div>
  );
}