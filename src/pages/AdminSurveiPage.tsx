import { useMemo, useState, type SVGProps } from "react";
import { useQueue } from "../context/useQueue";

type IconProps = SVGProps<SVGSVGElement>;

const HARI_MS = 24 * 60 * 60 * 1000;

function StarIcon({ filled, ...props }: { filled: boolean } & IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${filled ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-gray-300"}`}
      strokeWidth={1.5}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.5l2.95 6.28 6.93.6-5.24 4.6 1.57 6.79L12 17.02l-6.21 3.75 1.57-6.79-5.24-4.6 6.93-.6L12 2.5z"
      />
    </svg>
  );
}

function StarRow({ value }: { value: number }) {
  const bulat = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= bulat} />
      ))}
    </div>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0 4-4m-4 4-4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function IconStarBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.95 6.28 6.93.6-5.24 4.6 1.57 6.79L12 17.02l-6.21 3.75 1.57-6.79-5.24-4.6 6.93-.6L12 2.5z" />
    </svg>
  );
}

function IconUsersBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="9" cy="8" r="3" />
      <path strokeLinecap="round" d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path strokeLinecap="round" d="M15.5 20c.2-2.6 1.9-4.6 4-5.2" />
    </svg>
  );
}

function IconSmiley({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M8 14s1.5 2 4 2 4-2 4-2" />
      <path strokeLinecap="round" d="M9 9h.01M15 9h.01" />
    </svg>
  );
}

function IconTrendUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l6-6 4 4 6-8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 6h6v6" />
    </svg>
  );
}

function IconTrendDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8l6 6 4-4 6 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 18h6v-6" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14Z" />
    </svg>
  );
}

// Sinkron dengan daftar pertanyaan di SurveiKepuasanPage.tsx (warga)
const PERTANYAAN: Record<number, string> = {
  1: "Kemudahan menemukan informasi di website",
  2: "Kemudahan penggunaan fitur layanan",
  3: "Kecepatan akses & kinerja website",
  4: "Kelengkapan & kejelasan informasi",
  5: "Kepuasan keseluruhan terhadap layanan",
};

function formatTanggal(waktu: number): string {
  return new Date(waktu).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function rataRataSubmisi(ratings: Record<number, number>): number {
  const nilai = Object.values(ratings);
  return nilai.length > 0 ? nilai.reduce((a, b) => a + b, 0) / nilai.length : 0;
}

export default function AdminSurveiPage() {
  const { surveiList, hapusSurvei } = useQueue();
  const [hanyaAdaKomentar, setHanyaAdaKomentar] = useState(false);
  const [konfirmasiHapusId, setKonfirmasiHapusId] = useState<string | null>(null);

  // ---- Perbandingan 7 hari terakhir vs 7 hari sebelumnya, dasar trend di kartu ----
  // Sengaja TIDAK pakai Date.now() sama sekali (biar tidak melanggar aturan
  // purity apapun bentuknya) — acuan "sekarang" diambil dari timestamp
  // submission survei TERBARU yang sudah ada di data itu sendiri. Ini murni
  // turunan dari state (surveiList), jadi 100% pure/deterministik.
  const { periodeIni, periodeSebelumnya } = useMemo(() => {
    type Submisi = (typeof surveiList)[number];
    const kosong: { periodeIni: Submisi[]; periodeSebelumnya: Submisi[] } = {
      periodeIni: [],
      periodeSebelumnya: [],
    };
    if (surveiList.length === 0) return kosong;

    const referensiWaktu = Math.max(...surveiList.map((s) => s.timestamp));
    const batas7HariLalu = referensiWaktu - 7 * HARI_MS;
    const batas14HariLalu = referensiWaktu - 14 * HARI_MS;

    return {
      periodeIni: surveiList.filter((s) => s.timestamp >= batas7HariLalu),
      periodeSebelumnya: surveiList.filter(
        (s) => s.timestamp >= batas14HariLalu && s.timestamp < batas7HariLalu
      ),
    };
  }, [surveiList]);

  const rataRataKeseluruhan = useMemo(() => {
    if (surveiList.length === 0) return null;
    let totalSkor = 0;
    let totalJawaban = 0;
    surveiList.forEach((s) => {
      Object.values(s.ratings).forEach((v) => {
        totalSkor += v;
        totalJawaban += 1;
      });
    });
    return totalJawaban > 0 ? totalSkor / totalJawaban : null;
  }, [surveiList]);

  const trendRating = useMemo(() => {
    if (periodeIni.length === 0 || periodeSebelumnya.length === 0) return null;
    const rataIni =
      periodeIni.reduce((a, s) => a + rataRataSubmisi(s.ratings), 0) / periodeIni.length;
    const rataSebelum =
      periodeSebelumnya.reduce((a, s) => a + rataRataSubmisi(s.ratings), 0) /
      periodeSebelumnya.length;
    return rataIni - rataSebelum;
  }, [periodeIni, periodeSebelumnya]);

  const trendResponden = useMemo(() => {
    if (periodeSebelumnya.length === 0) return null;
    return ((periodeIni.length - periodeSebelumnya.length) / periodeSebelumnya.length) * 100;
  }, [periodeIni.length, periodeSebelumnya.length]);

  const tingkatKepuasan = useMemo(() => {
    if (surveiList.length === 0) return null;
    const puas = surveiList.filter((s) => rataRataSubmisi(s.ratings) >= 4).length;
    return (puas / surveiList.length) * 100;
  }, [surveiList]);

  const rataPerPertanyaan = useMemo(() => {
    const idPertanyaan = Object.keys(PERTANYAAN).map(Number);
    return idPertanyaan.map((id) => {
      const nilai = surveiList.map((s) => s.ratings[id]).filter((v): v is number => v !== undefined);
      const rata = nilai.length > 0 ? nilai.reduce((a, b) => a + b, 0) / nilai.length : 0;
      return { id, pertanyaan: PERTANYAAN[id], rata, jumlahJawaban: nilai.length };
    });
  }, [surveiList]);

  const komentarList = useMemo(() => {
    const list = hanyaAdaKomentar ? surveiList.filter((s) => s.saran) : surveiList;
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [surveiList, hanyaAdaKomentar]);

  const surveiDikonfirmasi = surveiList.find((s) => s.id === konfirmasiHapusId);

  const handleEksporPdf = () => window.print();

  const handleKonfirmasiHapus = () => {
    if (konfirmasiHapusId) hapusSurvei(konfirmasiHapusId);
    setKonfirmasiHapusId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Survei Kepuasan Masyarakat</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tinjauan ringkas mengenai umpan balik dan penilaian layanan dari warga.
          </p>
        </div>
        <button
          type="button"
          onClick={handleEksporPdf}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 print:hidden"
        >
          <IconDownload className="h-4 w-4" />
          Ekspor PDF
        </button>
      </div>

      {surveiList.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-gray-500">Belum ada survei yang masuk dari warga.</p>
        </div>
      ) : (
        <>
          {/* Kartu ringkasan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Rata-rata Rating</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IconStarBadge className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-2 flex items-end gap-1">
                <p className="text-4xl font-bold text-gray-900">
                  {rataRataKeseluruhan !== null ? rataRataKeseluruhan.toFixed(1) : "—"}
                </p>
                <p className="pb-1 text-base text-gray-400">/ 5.0</p>
              </div>
              {trendRating !== null && (
                <p
                  className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                    trendRating >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {trendRating >= 0 ? (
                    <IconTrendUp className="h-3.5 w-3.5" />
                  ) : (
                    <IconTrendDown className="h-3.5 w-3.5" />
                  )}
                  {trendRating >= 0 ? "+" : ""}
                  {trendRating.toFixed(1)} dari minggu lalu
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Total Responden</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <IconUsersBadge className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {surveiList.length.toLocaleString("id-ID")}
              </p>
              {trendResponden !== null && (
                <p
                  className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                    trendResponden >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {trendResponden >= 0 ? (
                    <IconTrendUp className="h-3.5 w-3.5" />
                  ) : (
                    <IconTrendDown className="h-3.5 w-3.5" />
                  )}
                  {trendResponden >= 0 ? "+" : ""}
                  {trendResponden.toFixed(0)}% dari minggu lalu
                </p>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Tingkat Kepuasan</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IconSmiley className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold text-gray-900">
                {tingkatKepuasan !== null ? `${tingkatKepuasan.toFixed(0)}%` : "—"}
              </p>
              <p className="mt-2 text-xs text-gray-400">Sangat Puas / Puas (rating ≥ 4)</p>
            </div>
          </div>

          {/* Rata-rata per pertanyaan */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Rata-rata per Pertanyaan</h2>
            <div className="flex flex-col gap-4">
              {rataPerPertanyaan.map((item) => (
                <div key={item.id}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">{item.pertanyaan}</p>
                    <span className="shrink-0 text-sm font-semibold text-gray-500">
                      {item.jumlahJawaban > 0 ? item.rata.toFixed(1) : "—"} / 5
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-yellow-400 transition-all"
                      style={{ width: `${(item.rata / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabel umpan balik */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-gray-900">Umpan Balik Terbaru</h2>
              <label className="flex items-center gap-2 text-sm text-gray-600 print:hidden">
                <input
                  type="checkbox"
                  checked={hanyaAdaKomentar}
                  onChange={(e) => setHanyaAdaKomentar(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Hanya yang ada saran/komentar
              </label>
            </div>

            {komentarList.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">Tidak ada respons yang cocok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase tracking-wide text-gray-400">
                      <th className="py-2 pr-4">Responden</th>
                      <th className="py-2 pr-4">Tanggal</th>
                      <th className="py-2 pr-4">Rating</th>
                      <th className="py-2 pr-4">Komentar</th>
                      <th className="py-2 pr-4 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {komentarList.map((s) => (
                      <tr key={s.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-800">Anonim</td>
                        <td className="pr-4 text-gray-500">{formatTanggal(s.timestamp)}</td>
                        <td className="pr-4">
                          <StarRow value={rataRataSubmisi(s.ratings)} />
                        </td>
                        <td className="max-w-xs pr-4 text-gray-600">
                          {s.saran ? (
                            <span className="line-clamp-2">{s.saran}</span>
                          ) : (
                            <span className="italic text-gray-400">Tidak ada saran/komentar.</span>
                          )}
                        </td>
                        <td className="pr-4 print:hidden">
                          <button
                            type="button"
                            onClick={() => setKonfirmasiHapusId(s.id)}
                            title="Hapus respons ini"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                          >
                            <IconTrash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-gray-400 print:hidden">
        Catatan: nama responden belum dikumpulkan lewat form survei (ditampilkan "Anonim" untuk
        semua), dan data survei belum tersimpan permanen di server — akan reset saat browser
        di-refresh.
      </p>

      {/* Dialog konfirmasi hapus */}
      {surveiDikonfirmasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 print:hidden">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-lg font-bold text-gray-900">Hapus respons survei ini?</p>
            <p className="mt-2 text-sm text-gray-500">
              Dikirim {formatTanggal(surveiDikonfirmasi.timestamp)}. Tindakan ini tidak bisa
              dibatalkan.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setKonfirmasiHapusId(null)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKonfirmasiHapus}
                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}