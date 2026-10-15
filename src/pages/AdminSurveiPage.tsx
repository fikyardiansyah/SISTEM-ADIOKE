import { useMemo, useState, type SVGProps } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQueue } from "../context/useQueue";

type IconProps = SVGProps<SVGSVGElement>;

const HARI_MS = 24 * 60 * 60 * 1000;
const WARNA_SENTIMEN = ["#2563eb", "#38bdf8", "#f59e0b", "#f43f5e"];
const LABEL_SENTIMEN = ["Sangat puas", "Puas", "Cukup", "Perlu perhatian"];

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

function IconChartBadge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5m0 14h16M8 15v-4m4 4V7m4 8v-6m4 6V9" />
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

function IconEye({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Sinkron dengan sembilan unsur SKM di SurveiKepuasanPage.tsx (warga)
const PERTANYAAN: Record<number, string> = {
  1: "Persyaratan pelayanan",
  2: "Sistem, mekanisme, dan prosedur",
  3: "Waktu penyelesaian",
  4: "Biaya/tarif",
  5: "Produk spesifikasi jenis layanan",
  6: "Kompetensi pelaksana",
  7: "Perilaku pelaksana",
  8: "Sarana dan prasarana",
  9: "Penanganan pengaduan, saran, dan masukan",
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

function labelKepuasan(nilai: number): string {
  const labels: Record<number, string> = {
    1: "Tidak Puas",
    2: "Kurang Puas",
    3: "Puas",
    4: "Sangat Puas",
  };
  return labels[nilai] ?? "Belum dinilai";
}

export default function AdminSurveiPage() {
  const { surveiList, hapusSurvei } = useQueue();
  const [hanyaAdaKomentar, setHanyaAdaKomentar] = useState(false);
  const [konfirmasiHapusId, setKonfirmasiHapusId] = useState<string | null>(null);
  const [detailSurveiId, setDetailSurveiId] = useState<string | null>(null);
  const [periodeDipilih, setPeriodeDipilih] = useState("semua");
  const [jenisLayananDipilih, setJenisLayananDipilih] = useState("semua");

  const pilihanPeriode = useMemo(() => {
    const periode = new Set(
      surveiList.map((survei) => {
        const tanggal = new Date(survei.timestamp);
        return `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, "0")}`;
      })
    );
    return [...periode].sort().reverse();
  }, [surveiList]);

  const surveiTerfilter = useMemo(
    () =>
      periodeDipilih === "semua"
        ? surveiList
        : surveiList.filter((survei) => {
            const tanggal = new Date(survei.timestamp);
            return `${tanggal.getFullYear()}-${String(tanggal.getMonth() + 1).padStart(2, "0")}` === periodeDipilih;
          }),
    [surveiList, periodeDipilih]
  );

  const pilihanJenisLayanan = useMemo(
    () => [...new Set(surveiList.map((survei) => survei.jenisLayanan).filter((jenis): jenis is string => Boolean(jenis)))].sort((a, b) => a.localeCompare(b, "id")),
    [surveiList]
  );

  const surveiTerpilih = useMemo(
    () =>
      jenisLayananDipilih === "semua"
        ? surveiTerfilter
        : jenisLayananDipilih === "tidak-tercatat"
          ? surveiTerfilter.filter((survei) => !survei.jenisLayanan)
          : surveiTerfilter.filter((survei) => survei.jenisLayanan === jenisLayananDipilih),
    [surveiTerfilter, jenisLayananDipilih]
  );

  const labelPeriode =
    periodeDipilih === "semua"
      ? "Semua periode"
      : new Date(`${periodeDipilih}-01T00:00:00`).toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });

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
    if (surveiTerpilih.length === 0) return kosong;

    const referensiWaktu = Math.max(...surveiTerpilih.map((s) => s.timestamp));
    const batas7HariLalu = referensiWaktu - 7 * HARI_MS;
    const batas14HariLalu = referensiWaktu - 14 * HARI_MS;

    return {
      periodeIni: surveiTerpilih.filter((s) => s.timestamp >= batas7HariLalu),
      periodeSebelumnya: surveiTerpilih.filter(
        (s) => s.timestamp >= batas14HariLalu && s.timestamp < batas7HariLalu
      ),
    };
  }, [surveiTerpilih]);

  const rataRataKeseluruhan = useMemo(() => {
    if (surveiTerpilih.length === 0) return null;
    let totalSkor = 0;
    let totalJawaban = 0;
    surveiTerpilih.forEach((s) => {
      Object.values(s.ratings).forEach((v) => {
        totalSkor += v;
        totalJawaban += 1;
      });
    });
    return totalJawaban > 0 ? totalSkor / totalJawaban : null;
  }, [surveiTerpilih]);

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
    if (surveiTerpilih.length === 0) return null;
    const puas = surveiTerpilih.filter((s) => rataRataSubmisi(s.ratings) >= 3).length;
    return (puas / surveiTerpilih.length) * 100;
  }, [surveiTerpilih]);

  const rataPerPertanyaan = useMemo(() => {
    const idPertanyaan = Object.keys(PERTANYAAN).map(Number);
    return idPertanyaan.map((id) => {
      const nilai = surveiTerpilih.map((s) => s.ratings[id]).filter((v): v is number => v !== undefined);
      const rata = nilai.length > 0 ? nilai.reduce((a, b) => a + b, 0) / nilai.length : 0;
      return { id, pertanyaan: PERTANYAAN[id], rata, jumlahJawaban: nilai.length };
    });
  }, [surveiTerpilih]);

  const distribusiSentimen = useMemo(() => {
    const jumlah = [0, 0, 0, 0];
    surveiTerpilih.forEach((survei) => {
      const rata = rataRataSubmisi(survei.ratings);
      if (rata >= 3.5) jumlah[0] += 1;
      else if (rata >= 2.5) jumlah[1] += 1;
      else if (rata >= 1.5) jumlah[2] += 1;
      else jumlah[3] += 1;
    });
    return LABEL_SENTIMEN.map((name, index) => ({
      name,
      value: jumlah[index],
      color: WARNA_SENTIMEN[index],
    })).filter((item) => item.value > 0);
  }, [surveiTerpilih]);

  const unsurPrioritas = useMemo(
    () => [...rataPerPertanyaan].filter((item) => item.jumlahJawaban > 0).sort((a, b) => a.rata - b.rata)[0],
    [rataPerPertanyaan]
  );

  const komentarList = useMemo(() => {
    const list = hanyaAdaKomentar ? surveiTerpilih.filter((s) => s.saran) : surveiTerpilih;
    return [...list].sort((a, b) => b.timestamp - a.timestamp);
  }, [surveiTerpilih, hanyaAdaKomentar]);

  const surveiDikonfirmasi = surveiList.find((s) => s.id === konfirmasiHapusId);
  const surveiDetail = surveiList.find((s) => s.id === detailSurveiId);

  const handleEksporPdf = () => window.print();

  const handleKonfirmasiHapus = () => {
    if (konfirmasiHapusId) hapusSurvei(konfirmasiHapusId);
    setKonfirmasiHapusId(null);
  };

  return (
    <div className="flex flex-col gap-5 text-slate-800">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:items-center xl:gap-8">
          <div className="min-w-0 max-w-xl">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              ANALISIS LAYANAN PUBLIK
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Survei Kepuasan Masyarakat (SKM)
            </h1>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Ringkasan pengalaman warga dan kualitas pelayanan Kecamatan Kuta Selatan.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] xl:grid-cols-[minmax(135px,0.8fr)_minmax(170px,1.2fr)_auto] xl:items-center">
            <label className="sr-only" htmlFor="survei-periode">Pilih periode</label>
            <select
              id="survei-periode"
              value={periodeDipilih}
              onChange={(event) => setPeriodeDipilih(event.target.value)}
              className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 print:hidden"
            >
              <option value="semua">Semua periode</option>
              {pilihanPeriode.map((periode) => (
                <option value={periode} key={periode}>
                  {new Date(`${periode}-01T00:00:00`).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor="survei-jenis-layanan">Pilih jenis layanan</label>
            <select
              id="survei-jenis-layanan"
              value={jenisLayananDipilih}
              onChange={(event) => setJenisLayananDipilih(event.target.value)}
              className="min-h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 print:hidden"
            >
              <option value="semua">Semua layanan</option>
              {pilihanJenisLayanan.map((jenis) => (
                <option value={jenis} key={jenis}>{jenis}</option>
              ))}
              <option value="tidak-tercatat">Layanan belum tercatat</option>
            </select>
            <button
              type="button"
              onClick={handleEksporPdf}
              className="flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 print:hidden"
            >
              <IconDownload className="h-4 w-4" />
              Ekspor laporan
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rata-rata rating</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <IconStarBadge className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              {rataRataKeseluruhan !== null ? rataRataKeseluruhan.toFixed(2) : "—"}
            </p>
            <span className="text-sm font-medium text-slate-400">/ 4.0</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {trendRating !== null ? (
              <>
                {trendRating >= 0 ? (
                  <IconTrendUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <IconTrendDown className="h-3.5 w-3.5 text-rose-600" />
                )}
                <span className={trendRating >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                  {trendRating >= 0 ? "+" : ""}{trendRating.toFixed(2)}
                </span>
                <span>dibanding periode 7 hari sebelumnya</span>
              </>
            ) : (
              <span>Nilai rata-rata dari seluruh unsur</span>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total responden</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <IconUsersBadge className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {surveiTerpilih.length.toLocaleString("id-ID")}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            {trendResponden !== null ? (
              <>
                {trendResponden >= 0 ? (
                  <IconTrendUp className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <IconTrendDown className="h-3.5 w-3.5 text-rose-600" />
                )}
                <span className={trendResponden >= 0 ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>
                  {trendResponden >= 0 ? "+" : ""}{trendResponden.toFixed(0)}%
                </span>
                <span>dibanding periode 7 hari sebelumnya</span>
              </>
            ) : (
              <span>Respons pada {labelPeriode.toLowerCase()}</span>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tingkat kepuasan</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <IconSmiley className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600">
            {tingkatKepuasan !== null ? `${tingkatKepuasan.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-3 text-xs text-slate-500">Responden dengan nilai rata-rata minimal 3 dari 4</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skor indeks</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <IconChartBadge className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <p className="text-3xl font-extrabold tracking-tight text-slate-900">
              {rataRataKeseluruhan !== null ? (rataRataKeseluruhan * 25).toFixed(1) : "—"}
            </p>
            <span className="text-sm font-medium text-slate-400">/ 100</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Konversi rating rata-rata ke skala 100</p>
        </article>
      </section>

      <section className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(290px,0.9fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <IconChartBadge className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Rata-rata per unsur pelayanan</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">Sembilan unsur standar pelayanan masyarakat</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">Baik · ≥ 3.5</span>
              <span className="rounded-lg bg-amber-50 px-2.5 py-1.5 font-medium text-amber-700">Perlu perhatian · &lt; 3.5</span>
            </div>
          </div>
          {surveiTerpilih.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Belum ada survei pada periode ini.
            </p>
          ) : (
            <div className="space-y-4">
              {rataPerPertanyaan.map((item) => {
                const persentase = (item.rata / 4) * 100;
                const warna = item.rata >= 3.5 ? "from-emerald-400 to-emerald-600" : item.rata >= 2.5 ? "from-blue-400 to-cyan-500" : "from-amber-400 to-orange-500";
                return (
                  <div key={item.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                          {item.id}
                        </span>
                        <p className="truncate text-xs font-medium text-slate-700 sm:text-sm">{item.pertanyaan}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-slate-600">
                        {item.jumlahJawaban > 0 ? item.rata.toFixed(2) : "—"} <span className="font-normal text-slate-400">/ 4</span>
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`Nilai ${item.pertanyaan}`}
                      aria-valuemin={0}
                      aria-valuemax={4}
                      aria-valuenow={item.rata}
                    >
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${warna} transition-all duration-500`}
                        style={{ width: `${persentase}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <div className="flex flex-col gap-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Distribusi sentimen warga</h2>
            <p className="mt-1 text-xs text-slate-500">Pengelompokan berdasarkan rata-rata nilai tiap respons</p>
            {surveiTerpilih.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">Belum ada data sentimen.</p>
            ) : (
              <>
                <div className="relative mx-auto mt-1 h-52 w-full max-w-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribusiSentimen}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="66%"
                        outerRadius="88%"
                        paddingAngle={3}
                        stroke="none"
                      >
                        {distribusiSentimen.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} respons`, "Jumlah"]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {surveiTerpilih.length.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[11px] text-slate-500">respons</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {LABEL_SENTIMEN.map((label, index) => {
                    const jumlah = distribusiSentimen.find((item) => item.name === label)?.value ?? 0;
                    const persentase = surveiTerpilih.length ? (jumlah / surveiTerpilih.length) * 100 : 0;
                    return (
                      <div className="flex min-w-0 items-center gap-2 text-[11px]" key={label}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: WARNA_SENTIMEN[index] }} />
                        <span className="truncate text-slate-600">{label}</span>
                        <span className="ml-auto shrink-0 font-semibold text-slate-500">{persentase.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </article>

          <article className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-800 p-5 text-white shadow-sm">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-100">
              Fokus peningkatan
            </span>
            {unsurPrioritas ? (
              <>
                <h2 className="mt-3 text-base font-bold leading-snug">{unsurPrioritas.pertanyaan}</h2>
                <p className="mt-1 text-sm text-blue-100">
                  Nilai rata-rata {unsurPrioritas.rata.toFixed(2)} dari 4 berdasarkan {unsurPrioritas.jumlahJawaban} penilaian.
                </p>
                <p className="mt-3 border-t border-white/15 pt-3 text-xs leading-relaxed text-blue-100">
                  Unsur dengan nilai terendah pada periode terpilih. Tinjau umpan balik warga untuk menentukan tindak lanjut.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-blue-100">
                Data unsur prioritas akan muncul setelah respons survei diterima.
              </p>
            )}
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Umpan balik terbaru</h2>
            <p className="mt-1 text-xs text-slate-500">Saran dan penilaian yang dikirim warga</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 print:hidden">
            <input
              type="checkbox"
              checked={hanyaAdaKomentar}
              onChange={(e) => setHanyaAdaKomentar(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Hanya yang ada saran
          </label>
        </div>

        {komentarList.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            {surveiTerpilih.length === 0 ? "Belum ada survei yang masuk pada filter ini." : "Tidak ada respons yang cocok dengan filter."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Responden</th>
                  <th className="py-3 pr-4">Tanggal</th>
                  <th className="py-3 pr-4">Jenis layanan</th>
                  <th className="py-3 pr-4">Rating</th>
                  <th className="py-3 pr-4">Saran / komentar</th>
                  <th className="py-3 pr-2 text-right print:hidden">Detail / Aksi</th>
                </tr>
              </thead>
              <tbody>
                {komentarList.map((survei) => (
                  <tr key={survei.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70">
                    <td className="py-3 pr-4 font-semibold text-slate-700">{survei.nama || "Anonim"}</td>
                    <td className="whitespace-nowrap pr-4 text-xs text-slate-500">{formatTanggal(survei.timestamp)}</td>
                    <td className="max-w-xs pr-4 text-xs text-slate-600">
                      {survei.jenisLayanan || <span className="italic text-slate-400">Belum tercatat</span>}
                    </td>
                    <td className="pr-4">
                      <div className="flex items-center gap-2">
                        <StarRow value={(rataRataSubmisi(survei.ratings) / 4) * 5} />
                        <span className="text-xs text-slate-500">{rataRataSubmisi(survei.ratings).toFixed(1)}/4</span>
                      </div>
                    </td>
                    <td className="max-w-sm pr-4 text-xs text-slate-600">
                      {survei.saran ? (
                        <span className="line-clamp-2">{survei.saran}</span>
                      ) : (
                        <span className="italic text-slate-400">Tidak ada saran</span>
                      )}
                    </td>
                    <td className="pr-2 text-right print:hidden">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailSurveiId(survei.id)}
                          title="Lihat detail survei"
                          aria-label={`Lihat detail survei dari ${survei.nama || "responden anonim"}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setKonfirmasiHapusId(survei.id)}
                          title="Hapus respons ini"
                          aria-label={`Hapus respons ${formatTanggal(survei.timestamp)}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 transition hover:bg-rose-100"
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
      </section>

      <p className="text-xs text-slate-400 print:hidden">
        Menampilkan {surveiTerpilih.length.toLocaleString("id-ID")} respons dari {labelPeriode.toLowerCase()}
        {jenisLayananDipilih !== "semua" && ` untuk ${jenisLayananDipilih === "tidak-tercatat" ? "layanan yang belum tercatat" : jenisLayananDipilih}`}.
      </p>

      {surveiDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm print:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetailSurveiId(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="survei-detail-title"
            className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Detail respons survei
                </span>
                <h2 id="survei-detail-title" className="mt-1 text-lg font-bold text-slate-900">
                  {surveiDetail.nama || "Responden anonim"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">{formatTanggal(surveiDetail.timestamp)}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailSurveiId(null)}
                aria-label="Tutup detail survei"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Jenis layanan</p>
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {surveiDetail.jenisLayanan || "Belum tercatat"}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">Penilaian 9 unsur pelayanan</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Rata-rata {rataRataSubmisi(surveiDetail.ratings).toFixed(2)} / 4
                  </span>
                </div>
                <div className="space-y-2">
                  {Object.entries(PERTANYAAN).map(([id, pertanyaan]) => {
                    const nilai = surveiDetail.ratings[Number(id)];
                    return (
                      <div
                        key={id}
                        className="flex flex-col gap-2 rounded-xl border border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
                            {id}
                          </span>
                          <span className="text-xs font-medium leading-relaxed text-slate-700">{pertanyaan}</span>
                        </div>
                        <span
                          className={`shrink-0 pl-8 text-xs font-bold sm:pl-0 ${
                            nilai >= 3
                              ? "text-emerald-700"
                              : nilai
                                ? "text-amber-700"
                                : "text-slate-400"
                          }`}
                        >
                          {nilai ? labelKepuasan(nilai) : "Belum dinilai"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Saran dan masukan</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {surveiDetail.saran || "Responden tidak memberikan saran."}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

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