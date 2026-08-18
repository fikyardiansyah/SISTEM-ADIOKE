import { useState, type FormEvent, type SVGProps, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { useQueue } from "../context/useQueue";
import type { KategoriIconKey, KategoriLayanan } from "../context/QueueContext";

type IconProps = SVGProps<SVGSVGElement>;
const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconPeople(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.5 20c.2-2.6 1.9-4.6 4-5.2" />
    </svg>
  );
}
function IconBuilding(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1" />
    </svg>
  );
}
function IconDocument(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M7 3h7l4 4v14H7Z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13.5c.5-.6 1-.6 1.5 0s1 .6 1.5 0M9.5 16.5c.5-.6 1-.6 1.5 0s1 .6 1.5 0" />
    </svg>
  );
}
function IconTag(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M20.6 12.6 12.4 3.4A2 2 0 0 0 11 3H5a2 2 0 0 0-2 2v6c0 .5.2 1 .6 1.4l8.2 9.2a2 2 0 0 0 2.8.1l6-6a2 2 0 0 0-.1-2.9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </svg>
  );
}
function IconHeart(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 20s-7-4.4-9.5-8.8C1 8 2.5 4.8 6 4.2c2-.3 3.7.7 6 3 2.3-2.3 4-3.3 6-3 3.5.6 5 3.8 3.5 7C19 15.6 12 20 12 20Z" />
    </svg>
  );
}
function IconBook(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5Z" />
    </svg>
  );
}
function IconBriefcase(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="1.5" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M3 12h18" />
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
function IconClose(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconArrowRight(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
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

const ICON_MAP: Record<KategoriIconKey, (props: IconProps) => ReactElement> = {
  people: IconPeople,
  building: IconBuilding,
  document: IconDocument,
  tag: IconTag,
  heart: IconHeart,
  book: IconBook,
  briefcase: IconBriefcase,
};

const ICON_CHOICES: { key: KategoriIconKey; label: string }[] = [
  { key: "people", label: "Orang / Kependudukan" },
  { key: "building", label: "Bangunan / Perizinan" },
  { key: "document", label: "Dokumen / Pajak" },
  { key: "tag", label: "Umum" },
  { key: "heart", label: "Kesehatan" },
  { key: "book", label: "Pendidikan" },
  { key: "briefcase", label: "Usaha" },
];

function formatTanggalRelatif(waktu: number): string {
  const detik = Math.floor((Date.now() - waktu) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit yang lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam yang lalu`;
  const hari = Math.floor(jam / 24);
  if (hari < 7) return `${hari} hari yang lalu`;
  const minggu = Math.floor(hari / 7);
  return `${minggu} minggu yang lalu`;
}

export default function AdminKategoriPage() {
  const { kategoriList, layananList, loketStatus, tambahKategori, hapusKategori } = useQueue();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [namaBaru, setNamaBaru] = useState("");
  const [deskripsiBaru, setDeskripsiBaru] = useState("");
  const [iconBaru, setIconBaru] = useState<KategoriIconKey>("tag");
  const [error, setError] = useState("");
  const [kategoriDihapus, setKategoriDihapus] = useState<KategoriLayanan | null>(null);

  const filtered = kategoriList.filter((k) =>
    k.nama.toLowerCase().includes(search.toLowerCase())
  );

  const jumlahLayananAktif = (namaKategori: string) =>
    layananList.filter(
      (l) => (l.kategori ?? "Umum") === namaKategori && (loketStatus[l.id] ?? "buka") === "buka"
    ).length;

  // Total loket yang terdaftar di kategori ini (buka ATAU tutup) — dipakai untuk
  // peringatan sebelum hapus, karena loket yang tutup pun tetap "pakai" kategori ini.
  const jumlahLoketTerdaftar = (namaKategori: string) =>
    layananList.filter((l) => (l.kategori ?? "Umum") === namaKategori).length;

  const handleHapusKategori = () => {
    if (kategoriDihapus) hapusKategori(kategoriDihapus.nama);
    setKategoriDihapus(null);
  };

  const handleTambahKategori = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = namaBaru.trim();
    if (!trimmed) {
      setError("Nama kategori wajib diisi.");
      return;
    }
    if (kategoriList.some((k) => k.nama.toLowerCase() === trimmed.toLowerCase())) {
      setError("Kategori dengan nama ini sudah ada.");
      return;
    }

    tambahKategori(trimmed, { icon: iconBaru, deskripsi: deskripsiBaru.trim() || undefined });

    setNamaBaru("");
    setDeskripsiBaru("");
    setIconBaru("tag");
    setError("");
    setShowModal(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori Layanan</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Kelola daftar kategori layanan publik untuk Kecamatan Kuta Selatan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <IconPlus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 sm:max-w-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3-3" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kategori..."
          className="w-full text-sm outline-none"
        />
      </div>

      {/* Grid kartu kategori */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
          Tidak ada kategori yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => {
            const Icon = ICON_MAP[k.icon] ?? IconTag;
            const jumlahAktif = jumlahLayananAktif(k.nama);

            return (
              <div key={k.nama} className="flex flex-col rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {jumlahAktif} Layanan Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => setKategoriDihapus(k)}
                      title="Hapus kategori"
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`Hapus kategori ${k.nama}`}
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h2 className="mt-4 text-lg font-bold text-gray-900">{k.nama}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
                  {k.deskripsi || "Belum ada deskripsi untuk kategori ini."}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400">
                    Terakhir diperbarui: {formatTanggalRelatif(k.updatedAt)}
                  </span>
                  <Link
                    to={`/admin/loket?kategori=${encodeURIComponent(k.nama)}`}
                    className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Kelola Layanan
                    <IconArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog konfirmasi hapus kategori */}
      {kategoriDihapus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setKategoriDihapus(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <IconTrash className="h-6 w-6" />
            </div>
            <p className="text-lg font-bold text-gray-900">Hapus kategori ini?</p>
            <p className="mt-1 text-sm text-gray-500">{kategoriDihapus.nama}</p>

            {jumlahLoketTerdaftar(kategoriDihapus.nama) > 0 && (
              <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-600">
                Masih ada <strong>{jumlahLoketTerdaftar(kategoriDihapus.nama)} loket</strong> yang
                memakai kategori ini. Data loket tidak akan terhapus, tapi kategorinya perlu
                diganti manual lewat halaman Layanan Loket.
              </p>
            )}

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setKategoriDihapus(null)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleHapusKategori}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Kategori */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Tambah Kategori</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 transition hover:text-gray-600"
                aria-label="Tutup"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleTambahKategori} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={namaBaru}
                  onChange={(e) => setNamaBaru(e.target.value)}
                  placeholder="misal: Kesehatan"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Deskripsi <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <textarea
                  value={deskripsiBaru}
                  onChange={(e) => setDeskripsiBaru(e.target.value)}
                  placeholder="Jelaskan cakupan layanan di kategori ini..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Pilih Ikon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_CHOICES.map((opt) => {
                    const Icon = ICON_MAP[opt.key];
                    const dipilih = iconBaru === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        title={opt.label}
                        onClick={() => setIconBaru(opt.key)}
                        className={`flex h-14 items-center justify-center rounded-xl border-2 transition ${
                          dipilih
                            ? "border-blue-600 bg-blue-50 text-blue-600"
                            : "border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}

              <div className="mt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}