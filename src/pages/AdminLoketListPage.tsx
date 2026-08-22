import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQueue } from "../context/useQueue";

const ITEMS_PER_PAGE = 10;

export default function AdminLoketListPage() {
  const { layananList, counts, currentServing, loketStatus, tutupLoket, bukaLoket, resetSemuaAntrian } = useQueue();

  const [searchParams, setSearchParams] = useSearchParams();
  const kategoriFilter = searchParams.get("kategori") ?? "";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [konfirmasiTutupId, setKonfirmasiTutupId] = useState<string | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const filtered = useMemo(
    () =>
      layananList.filter(
        (l) =>
          l.nama.toLowerCase().includes(search.toLowerCase()) &&
          (!kategoriFilter || (l.kategori ?? "Umum") === kategoriFilter)
      ),
    [search, kategoriFilter, layananList]
  );

  const hapusFilterKategori = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("kategori");
    setSearchParams(next);
    setPage(1);
  };

  const totalPages = Math.max(Math.ceil(filtered.length / ITEMS_PER_PAGE), 1);
  const pageSafe = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (pageSafe - 1) * ITEMS_PER_PAGE,
    pageSafe * ITEMS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // reset ke halaman 1 tiap kali cari
  };

  const handleKonfirmasiTutup = () => {
    if (konfirmasiTutupId) tutupLoket(konfirmasiTutupId);
    setKonfirmasiTutupId(null);
  };

  const loketDikonfirmasi = layananList.find((l) => l.id === konfirmasiTutupId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header + breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Layanan Loket</h1>
          <p className="text-sm text-gray-400">
            Admin <span className="mx-1">›</span> Kelola Layanan Loket
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-2 rounded-full border-2 border-red-500 px-5 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.93 14A8 8 0 1 0 6.34 6.34" />
            </svg>
            Reset Semua Antrean
          </button>
          <Link
            to="/admin/loket/tambah"
            className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Tambah Layanan Loket
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {/* Filter kategori aktif — muncul kalau datang dari "Kelola Layanan" di halaman Kategori */}
        {kategoriFilter && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">Menampilkan kategori:</span>
            <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {kategoriFilter}
              <button
                type="button"
                onClick={hapusFilterKategori}
                className="text-blue-400 transition hover:text-blue-700"
                aria-label="Hapus filter kategori"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </span>
          </div>
        )}

        {/* Search bar */}
        <div className="mb-4 flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 max-w-sm">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3-3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari nama loket..."
            className="w-full text-sm focus:outline-none"
          />
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-blue-600 text-xs uppercase tracking-wide text-white">
                <th className="rounded-l-xl py-3 pl-4 pr-4">Nama Loket</th>
                <th className="py-3 pr-4">Kategori</th>
                <th className="py-3 pr-4">Total Antrian</th>
                <th className="py-3 pr-4">Dilayani</th>
                <th className="py-3 pr-4">Menunggu</th>
                <th className="py-3 pr-4">Status</th>
                <th className="rounded-r-xl py-3 pr-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Tidak ada loket yang cocok dengan pencarian.
                  </td>
                </tr>
              )}

              {paginated.map((l) => {
                const total = counts[l.id] ?? 0;
                const dilayani = currentServing[l.id] ?? 0;
                const menunggu = Math.max(total - dilayani, 0);
                const status = loketStatus[l.id] ?? "buka";
                const sedangBuka = status === "buka";

                return (
                  <tr key={l.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pl-4 pr-4">
                      <Link to={`/admin/loket/${l.id}`} className="flex items-center gap-3">
                        <img
                          src={l.icon}
                          alt={l.nama}
                          className="h-8 w-8 rounded-full border object-cover"
                        />
                        <span className="font-medium text-gray-800 hover:underline">{l.nama}</span>
                      </Link>
                    </td>
                    <td className="pr-4 text-gray-600">{l.kategori ?? "Umum"}</td>
                    <td className="pr-4 text-gray-700">{total}</td>
                    <td className="pr-4 font-semibold text-green-600">{dilayani}</td>
                    <td className="pr-4 font-semibold text-orange-500">{menunggu}</td>
                    <td className="pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          sedangBuka
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {sedangBuka ? "Buka" : "Tutup"}
                      </span>
                    </td>
                    <td className="pr-4">
                      <div className="flex items-center gap-2">
                        {/* Lihat detail loket */}
                        <Link
                          to={`/admin/loket/${l.id}`}
                          title="Lihat"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white transition hover:bg-blue-600"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>

                        {/* Buka loket */}
                        <button
                          type="button"
                          onClick={() => bukaLoket(l.id)}
                          disabled={sedangBuka}
                          className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          Buka
                        </button>

                        {/* Tutup loket */}
                        <button
                          type="button"
                          onClick={() => setKonfirmasiTutupId(l.id)}
                          disabled={!sedangBuka}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          Tutup
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
          <p>
            Menampilkan {filtered.length === 0 ? 0 : (pageSafe - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(pageSafe * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} loket
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={pageSafe === 1}
              className="rounded-full border border-gray-200 px-4 py-1.5 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={pageSafe === totalPages}
              className="rounded-full border border-gray-200 px-4 py-1.5 font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi tutup loket */}
      {loketDikonfirmasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-bold text-gray-900">
              Apakah ingin menutup layanan loket?
            </p>
            <p className="mt-2 text-sm text-gray-500">{loketDikonfirmasi.nama}</p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setKonfirmasiTutupId(null)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKonfirmasiTutup}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Ya, Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog konfirmasi reset semua antrean */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.93 14A8 8 0 1 0 6.34 6.34" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-900">Reset Semua Antrean?</p>
            <p className="mt-2 text-sm text-gray-500">
              Semua tiket antrean akan dihapus dan nomor urut semua loket akan kembali ke{" "}
              <span className="font-semibold text-red-600">0</span>. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetSemuaAntrian();
                  setShowResetDialog(false);
                }}
                className="flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.93 14A8 8 0 1 0 6.34 6.34" />
                </svg>
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}