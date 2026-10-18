import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../context/useQueue";

// Pilihan ikon bawaan — reuse file gambar yang sudah ada di /public/images/
// (dipakai juga oleh layanan default di data/layanan.ts), supaya tidak
// tergantung file baru yang belum tentu ada. Kalau mau nambah pilihan,
// taruh gambar baru di /public/images/ lalu daftarkan di sini.
const ICON_OPTIONS = [
  { id: "ektp", label: "E-KTP & KIA", src: "/images/icon-ektp.png" },
  { id: "samsat", label: "Samsat / Pajak", src: "/images/icon-samsat.png" },
  { id: "kependudukan", label: "Kependudukan", src: "/images/icon-kependudukan.png" },
  { id: "oss", label: "Perizinan / OSS", src: "/images/icon-oss.png" },
  { id: "warkah", label: "Warkah & Perwalian", src: "/images/icon-warkah.png" },
  { id: "rekam-ektp", label: "Rekam E-KTP", src: "/images/icon-rekam-ektp.png" },
  { id: "default", label: "Umum / Lainnya", src: "/images/icon-default-loket.png" },
];

export default function AdminTambahLoketPage() {
  const navigate = useNavigate();
  const { tambahLoket, kategoriList } = useQueue();

  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [prefix, setPrefix] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [iconSrc, setIconSrc] = useState("");
  const [statusBuka, setStatusBuka] = useState(true);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !kategori || !prefix.trim() || !iconSrc) {
      setError("Nama loket, kategori, kode awalan, dan ikon wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await tambahLoket(
        {
          nama: nama.trim(),
          // "Nama Tampilan di Struk" diturunkan otomatis dari Nama Loket,
          // supaya form tetap ringkas sesuai desain (tidak ada field terpisah).
          namaLoket: `LAYANAN ${nama.trim().toUpperCase()}`,
          prefix: prefix.trim().toUpperCase().slice(0, 1),
          jumlahAntrianAwal: 0,
          icon: iconSrc,
          kategori,
          deskripsi: deskripsi.trim() || undefined,
          variant: "biru",
        },
        statusBuka ? "buka" : "tutup"
      );

      navigate("/admin/loket");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan layanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-1 text-sm text-gray-400">
        Layanan Loket <span className="mx-1">›</span>
        <span className="font-medium text-gray-600">Tambah Layanan</span>
      </p>

      <h1 className="text-3xl font-extrabold text-blue-600">Formulir Tambah Layanan</h1>
      <p className="mb-6 mt-1 text-sm text-gray-500">
        Lengkapi informasi di bawah ini untuk menambahkan loket layanan baru ke dalam sistem.
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Nama Loket</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="e.g., Loket 1 - Kependudukan"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>
                Pilih Kategori
              </option>
              {kategoriList.map((k) => (
                <option key={k.nama} value={k.nama}>
                  {k.nama}
                </option>
              ))}
            </select>
            <a href="/admin/kategori" className="mt-1 inline-block text-xs font-medium text-blue-600 hover:underline">
              Kelola daftar kategori →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Kode Awalan Antrean
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.slice(0, 1).toUpperCase())}
              placeholder="A"
              maxLength={1}
              className="flex h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center text-xl font-bold uppercase text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1.5 text-xs text-gray-400">Satu huruf kapital (A–Z)</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">Pilih Ikon</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-blue-500 transition hover:border-blue-500 hover:bg-blue-100"
              >
                {iconSrc ? (
                  <img src={iconSrc} alt="Ikon terpilih" className="h-full w-full object-cover" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                Browse Icons
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-800">
            Deskripsi Layanan
          </label>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Jelaskan fungsi dan layanan yang diberikan di loket ini..."
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status awal loket */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 p-5">
          <div>
            <p className="font-bold text-gray-900">Status Awal Loket</p>
            <p className="mt-0.5 text-sm text-gray-500">
              Tentukan apakah loket ini langsung aktif dan menerima antrean saat disimpan.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={statusBuka}
            onClick={() => setStatusBuka((v) => !v)}
            className={`flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-semibold transition ${
              statusBuka ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                statusBuka ? "translate-x-0" : "translate-x-0"
              }`}
            />
            {statusBuka ? "Buka" : "Tutup"}
          </button>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/loket")}
            className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            {loading ? "Menyimpan..." : "Simpan Layanan"}
          </button>
        </div>
      </form>

      {/* Modal browse icons */}
      {showIconPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowIconPicker(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Pilih Ikon Loket</h3>
              <button
                type="button"
                onClick={() => setShowIconPicker(false)}
                className="text-gray-400 transition hover:text-gray-600"
                aria-label="Tutup"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setIconSrc(opt.src);
                    setShowIconPicker(false);
                  }}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition hover:border-blue-400 hover:bg-blue-50 ${
                    iconSrc === opt.src ? "border-blue-600 bg-blue-50" : "border-gray-100"
                  }`}
                >
                  <img src={opt.src} alt={opt.label} className="h-10 w-10 rounded-full object-cover" />
                  <span className="text-xs font-medium leading-tight text-gray-600">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
