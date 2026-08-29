import { useMemo, useState, type SVGProps } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQueue } from "../context/useQueue";

type IconProps = SVGProps<SVGSVGElement>;
const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconTimer(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6M12 2v3" />
    </svg>
  );
}
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
function IconCheck(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}
function IconWarning(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  );
}
function IconClock(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconDownload(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3v13m0 0-4-4m4 4 4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}
function IconArrowUp(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
function IconArrowDown(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

type RentangWaktu = "7" | "30" | "90" | "semua";

const OPSI_RENTANG: { value: RentangWaktu; label: string }[] = [
  { value: "7", label: "7 Hari Terakhir" },
  { value: "30", label: "30 Hari Terakhir" },
  { value: "90", label: "90 Hari Terakhir" },
  { value: "semua", label: "Semua Waktu" },
];

const TARGET_TUNGGU_MENIT = 20;

function rentangKeMs(rentang: RentangWaktu): number | null {
  if (rentang === "semua") return null;
  return Number(rentang) * 24 * 60 * 60 * 1000;
}

function TrendBadge({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || previous === 0) {
    return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-400">—</span>;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) {
    return <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">0%</span>;
  }
  const naik = pct > 0;
  return (
    <span className="flex items-center gap-0.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
      {naik ? <IconArrowUp className="h-3 w-3" /> : <IconArrowDown className="h-3 w-3" />}
      {Math.abs(pct)}%
    </span>
  );
}

function exportCSV(rows: { nama: string; jumlah: number }[]) {
  const header = "Nama Layanan,Jumlah Tiket\n";
  const body = rows.map((r) => `"${r.nama}",${r.jumlah}`).join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `distribusi-layanan-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminLaporanPage() {
  const { layananList, riwayatAntrian, kategoriList } = useQueue();

  // Filter "pending" (dipilih di dropdown) vs "diterapkan" (dipakai untuk
  // hitung statistik) — supaya tombol "Terapkan Filter" beneran ada gunanya,
  // bukan cuma UI kosong seperti di mockup.
  const [rentangPending, setRentangPending] = useState<RentangWaktu>("30");
  const [kategoriPending, setKategoriPending] = useState<string>("semua");
  const [rentang, setRentang] = useState<RentangWaktu>("30");
  const [kategoriFilter, setKategoriFilter] = useState<string>("semua");
  const [showSemuaBottleneck, setShowSemuaBottleneck] = useState(false);

  // "now" dulu diambil lewat useEffect (setNow(Date.now()) di dalam efek),
  // tapi React 19 memperingatkan itu sebagai "setState synchronously within
  // an effect" karena memicu render tambahan setelah mount. Solusinya:
  // ambil sekali lewat lazy initializer useState — ini HANYA berjalan satu
  // kali saat komponen pertama dibuat, jadi tidak butuh useEffect sama
  // sekali dan tidak ada render tambahan.
  const [now, setNow] = useState<number>(() => Date.now());

  const handleTerapkanFilter = () => {
    setRentang(rentangPending);
    setKategoriFilter(kategoriPending);
    setNow(Date.now()); // refresh juga titik acuan waktunya saat filter diterapkan
  };

  const loketKategoriMap = useMemo(() => {
    const map = new Map<string, string>();
    layananList.forEach((l) => map.set(l.id, l.kategori ?? "Umum"));
    return map;
  }, [layananList]);

  const loketNamaMap = useMemo(() => {
    const map = new Map<string, string>();
    layananList.forEach((l) => map.set(l.id, l.nama));
    return map;
  }, [layananList]);

  const rentangMs = rentangKeMs(rentang);

  // Logika filter di-inline langsung di sini (bukan lewat fungsi helper
  // terpisah seperti sebelumnya) supaya ESLint bisa memverifikasi semua
  // dependency useMemo dengan benar — fungsi biasa yang didefinisikan di
  // body komponen dianggap "berubah tiap render", jadi kalau dipanggil dari
  // dalam useMemo, linter tidak bisa yakin apa saja yang sebenarnya dipakai.
  const eventsSekarang = useMemo(() => {
    return riwayatAntrian.filter((e) => {
      const cocokWaktu = rentangMs === null || now - e.timestamp <= rentangMs;
      const cocokKategori =
        kategoriFilter === "semua" || loketKategoriMap.get(e.loketId) === kategoriFilter;
      return cocokWaktu && cocokKategori;
    });
  }, [riwayatAntrian, rentangMs, kategoriFilter, loketKategoriMap, now]);

  // Periode sebelumnya (durasi sama, langsung sebelum periode sekarang) — dasar trend %.
  // Untuk "Semua Waktu" tidak ada pembanding, jadi trend ditampilkan "—".
  const eventsSebelumnya = useMemo(() => {
    if (rentangMs === null) return null;
    return riwayatAntrian.filter((e) => {
      const cocokWaktu = now - e.timestamp > rentangMs && now - e.timestamp <= rentangMs * 2;
      const cocokKategori = kategoriFilter === "semua" || loketKategoriMap.get(e.loketId) === kategoriFilter;
      return cocokWaktu && cocokKategori;
    });
  }, [riwayatAntrian, rentangMs, kategoriFilter, loketKategoriMap, now]);

  const hitungRataTunggu = (events: typeof riwayatAntrian) => {
    const dilayani = events.filter((e) => e.waktuDilayani !== undefined);
    if (dilayani.length === 0) return null;
    const totalMenit = dilayani.reduce(
      (sum, e) => sum + (e.waktuDilayani! - e.timestamp) / 60000,
      0
    );
    return totalMenit / dilayani.length;
  };

  const totalSekarang = eventsSekarang.length;
  const totalSebelumnya = eventsSebelumnya?.length ?? null;

  const rataTungguSekarang = hitungRataTunggu(eventsSekarang);
  const rataTungguSebelumnya = eventsSebelumnya ? hitungRataTunggu(eventsSebelumnya) : null;

  const dilayaniSekarang = eventsSekarang.filter((e) => e.status === "dilayani").length;
  const tingkatSelesaiSekarang = totalSekarang > 0 ? (dilayaniSekarang / totalSekarang) * 100 : 0;
  const dilayaniSebelumnya = eventsSebelumnya?.filter((e) => e.status === "dilayani").length ?? 0;  
  const tingkatSelesaiSebelumnya =
    eventsSebelumnya && eventsSebelumnya.length > 0
      ? (dilayaniSebelumnya / eventsSebelumnya.length) * 100
      : null;

  // Distribusi layanan terpopuler — top 6 loket berdasar jumlah tiket di rentang ini
  const distribusi = useMemo(() => {
    const map = new Map<string, number>();
    eventsSekarang.forEach((e) => map.set(e.loketId, (map.get(e.loketId) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([loketId, jumlah]) => ({ nama: loketNamaMap.get(loketId) ?? loketId, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 6);
  }, [eventsSekarang, loketNamaMap]);

  // Loket dengan rata-rata waktu tunggu terlama
  const bottleneck = useMemo(() => {
    const perLoket = new Map<string, { total: number; count: number }>();
    eventsSekarang
      .filter((e) => e.waktuDilayani !== undefined)
      .forEach((e) => {
        const menit = (e.waktuDilayani! - e.timestamp) / 60000;
        const cur = perLoket.get(e.loketId) ?? { total: 0, count: 0 };
        perLoket.set(e.loketId, { total: cur.total + menit, count: cur.count + 1 });
      });

    return Array.from(perLoket.entries())
      .map(([loketId, { total, count }]) => ({
        loketId,
        nama: loketNamaMap.get(loketId) ?? loketId,
        rataMenit: total / count,
      }))
      .sort((a, b) => b.rataMenit - a.rataMenit);
  }, [eventsSekarang, loketNamaMap]);

  const bottleneckDitampilkan = showSemuaBottleneck ? bottleneck : bottleneck.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>

      {/* Filter */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Performance Overview</h2>
          <p className="text-sm text-gray-500">Filter metrik berdasarkan tanggal dan kategori.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={rentangPending}
            onChange={(e) => setRentangPending(e.target.value as RentangWaktu)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
          >
            {OPSI_RENTANG.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={kategoriPending}
            onChange={(e) => setKategoriPending(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="semua">Semua Layanan</option>
            {kategoriList.map((k) => (
              <option key={k.nama} value={k.nama}>
                {k.nama}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleTerapkanFilter}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <IconTimer className="h-5 w-5" />
            </div>
            <TrendBadge current={rataTungguSekarang ?? 0} previous={rataTungguSebelumnya} />
          </div>
          <p className="mt-4 text-sm text-gray-500">Rata-rata Waktu Tunggu</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {rataTungguSekarang !== null ? `${Math.round(rataTungguSekarang)}m` : "—"}
          </p>
          <p className="mt-1 text-xs text-gray-400">Target: &lt; {TARGET_TUNGGU_MENIT}m</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <IconUsers className="h-5 w-5" />
            </div>
            <TrendBadge current={totalSekarang} previous={totalSebelumnya} />
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Antrian Diambil</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalSekarang.toLocaleString("id-ID")}</p>
          <p className="mt-1 text-xs text-gray-400">Total tiket pada periode ini</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <IconCheck className="h-5 w-5" />
            </div>
            <TrendBadge current={tingkatSelesaiSekarang} previous={tingkatSelesaiSebelumnya} />
          </div>
          <p className="mt-4 text-sm text-gray-500">Tingkat Penyelesaian</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{Math.round(tingkatSelesaiSekarang)}%</p>
          <p className="mt-1 text-xs text-gray-400">
            {dilayaniSekarang} dari {totalSekarang} tiket dilayani
          </p>
        </div>
      </div>

      {/* Chart + Bottleneck */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Distribusi Layanan Terpopuler</h2>
            <button
              type="button"
              onClick={() => exportCSV(distribusi)}
              disabled={distribusi.length === 0}
              className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:underline disabled:cursor-not-allowed disabled:text-gray-300 disabled:no-underline"
            >
              Export
              <IconDownload className="h-4 w-4" />
            </button>
          </div>

          {distribusi.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">
              Belum ada tiket pada rentang & kategori yang dipilih.
            </p>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribusi}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="nama" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="jumlah" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Loket Waktu Tunggu Terlama</h2>
          <p className="mt-1 text-sm text-gray-500">
            Loket dengan rata-rata waktu tunggu melebihi target ({TARGET_TUNGGU_MENIT} menit).
          </p>

          {bottleneckDitampilkan.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Belum ada data waktu tunggu.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {bottleneckDitampilkan.map((item) => {
                const overTarget = item.rataMenit > TARGET_TUNGGU_MENIT;
                const delta = Math.round(item.rataMenit - TARGET_TUNGGU_MENIT);
                return (
                  <li
                    key={item.loketId}
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                          overTarget ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {overTarget ? <IconWarning className="h-4 w-4" /> : <IconClock className="h-4 w-4" />}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.nama}</p>
                        <p className="text-xs text-gray-400">
                          Rata-rata tunggu: {Math.round(item.rataMenit)}m
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        overTarget ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {delta >= 0 ? `+${delta}m` : `${delta}m`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {bottleneck.length > 3 && (
            <button
              type="button"
              onClick={() => setShowSemuaBottleneck((v) => !v)}
              className="mt-4 w-full rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              {showSemuaBottleneck ? "Tampilkan Lebih Sedikit" : "Lihat Semua Loket"}
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Catatan: rata-rata waktu tunggu dihitung dari selisih waktu tiket diambil sampai
        dipanggil admin. Data ini tersimpan permanen di server (bukan lagi hilang saat
        di-refresh) — TAPI detail waktu per-tiket tidak ikut disimpan begitu admin menekan
        "Reset Semua Antrian" (cuma total/dilayani/menunggu-nya yang diarsipkan), jadi laporan
        waktu tunggu ini hanya mencakup periode sejak reset terakhir. Kartu "Satisfaction
        Rating" belum tersedia karena belum ada modul survei yang terhubung ke sistem ini.
      </p>
    </div>
  );
}