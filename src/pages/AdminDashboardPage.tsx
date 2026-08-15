import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";
import type { AntrianEvent } from "../context/QueueContext";

type Rentang = "harian" | "mingguan" | "bulanan";

interface RekapHari {
  startTs: number;
  label: string;
  total: number;
  dilayani: number;
  menunggu: number;
  events: AntrianEvent[];
}

export default function AdminDashboardPage() {
  const { counts, currentServing, loketStatus, riwayatAntrian, hapusRiwayatHari } = useQueue();
  const [rentang, setRentang] = useState<Rentang>("harian");
  const [detailHari, setDetailHari] = useState<RekapHari | null>(null);

  const totalAmbil = layananList.reduce((sum, l) => sum + (counts[l.id] ?? 0), 0);
  const totalDilayani = layananList.reduce((sum, l) => sum + (currentServing[l.id] ?? 0), 0);
  const totalMenunggu = Math.max(totalAmbil - totalDilayani, 0);
  const loketBuka = layananList.filter((l) => (loketStatus[l.id] ?? "buka") === "buka").length;

  const chartData = useMemo(() => buildChartData(riwayatAntrian, rentang), [riwayatAntrian, rentang]);

  const arsipHarian = useMemo(() => buildArsipHarian(riwayatAntrian), [riwayatAntrian]);

  const handleHapusHari = (hari: RekapHari) => {
    const yakin = window.confirm(
      `Hapus seluruh arsip antrian tanggal ${hari.label} (${hari.total} tiket)?`
    );
    if (yakin) hapusRiwayatHari(hari.startTs);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <Link
          to="/admin/loket"
          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Kelola Layanan Loket →
        </Link>
      </div>

      {/* Kartu ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Antrian Diambil" value={totalAmbil} color="text-blue-600" />
        <StatCard label="Sudah Dilayani" value={totalDilayani} color="text-green-600" />
        <StatCard label="Masih Menunggu" value={totalMenunggu} color="text-orange-500" />
        <StatCard label="Loket Buka" value={`${loketBuka} / ${layananList.length}`} color="text-blue-600" />
      </div>

      {/* Grafik statistik */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Statistik Antrian</h2>
          <div className="flex rounded-full bg-gray-100 p-1">
            {(["harian", "mingguan", "bulanan"] as Rentang[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setRentang(opt)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
                  rentang === opt ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="jumlah"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#2563eb" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs text-gray-400">
          Data grafik dihitung dari tiket yang diambil sejak halaman ini dibuka (belum tersimpan
          permanen di server — akan reset saat browser di-refresh).
        </p>
      </div>

      {/* Arsip / riwayat antrian per hari */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-gray-900">Riwayat Antrian Harian</h2>
          <span className="text-sm text-gray-400">{arsipHarian.length} hari tercatat</span>
        </div>

        {arsipHarian.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Belum ada arsip antrian yang tercatat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500">
                  <th className="py-2 pr-4 font-medium">No</th>
                  <th className="py-2 pr-4 font-medium">Tanggal</th>
                  <th className="py-2 pr-4 font-medium">Total Antrian</th>
                  <th className="py-2 pr-4 font-medium">Sudah Dilayani</th>
                  <th className="py-2 pr-4 font-medium">Masih Menunggu</th>
                  <th className="py-2 pr-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {arsipHarian.map((hari, idx) => (
                  <tr key={hari.startTs} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-500">{idx + 1}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900">{hari.label}</td>
                    <td className="py-3 pr-4 font-medium text-blue-600">{hari.total}</td>
                    <td className="py-3 pr-4 font-medium text-green-600">{hari.dilayani}</td>
                    <td className="py-3 pr-4 font-medium text-orange-500">{hari.menunggu}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailHari(hari)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                          aria-label={`Detail arsip tanggal ${hari.label}`}
                        >
                          <EyeIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleHapusHari(hari)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Hapus arsip tanggal ${hari.label}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal detail arsip per hari */}
      {detailHari && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setDetailHari(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Detail Arsip {detailHari.label}</h3>
              <span className="text-sm text-gray-400">{detailHari.total} tiket</span>
            </div>

            <div className="mt-5 flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Rekap per Loket
              </span>
              <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span>Dilayani</span>
                <span>Menunggu</span>
                <span className="w-16 text-center">Total</span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {rekapPerLoket(detailHari).map((item) => (
                <div key={item.loketId} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <p className="font-medium text-gray-900">{item.nama}</p>
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-gray-500">
                      Dilayani <span className="font-semibold text-green-600">{item.dilayani}</span>
                    </span>
                    <span className="text-gray-500">
                      Menunggu <span className="font-semibold text-orange-500">{item.menunggu}</span>
                    </span>
                    <span className="w-16 rounded-full bg-blue-50 px-3 py-1 text-center font-semibold text-blue-600">
                      {item.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDetailHari(null)}
              className="mt-6 w-full rounded-full bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function rekapPerLoket(hari: RekapHari) {
  return layananList
    .map((l) => {
      const eventsLoket = hari.events.filter((e) => e.loketId === l.id);
      return {
        loketId: l.id,
        nama: l.nama,
        total: eventsLoket.length,
        dilayani: eventsLoket.filter((e) => e.status === "dilayani").length,
        menunggu: eventsLoket.filter((e) => e.status === "menunggu").length,
      };
    })
    .filter((item) => item.total > 0);
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v12.5A1.5 1.5 0 0 1 15.5 21h-7A1.5 1.5 0 0 1 7 19.5V7h10Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" strokeLinecap="round" />
    </svg>
  );
}

function buildArsipHarian(riwayat: AntrianEvent[]): RekapHari[] {
  const map = new Map<number, RekapHari>();

  riwayat.forEach((event) => {
    const d = new Date(event.timestamp);
    d.setHours(0, 0, 0, 0);
    const startTs = d.getTime();

    if (!map.has(startTs)) {
      map.set(startTs, {
        startTs,
        label: d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        total: 0,
        dilayani: 0,
        menunggu: 0,
        events: [],
      });
    }

    const rekap = map.get(startTs)!;
    rekap.total += 1;
    if (event.status === "dilayani") rekap.dilayani += 1;
    else rekap.menunggu += 1;
    rekap.events.push(event);
  });

  return Array.from(map.values()).sort((a, b) => b.startTs - a.startTs);
}

function buildChartData(
  riwayat: { loketId: string; timestamp: number }[],
  rentang: Rentang
): { label: string; jumlah: number }[] {
  const now = new Date();

  if (rentang === "harian") {
    const buckets: { label: string; start: number; end: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      buckets.push({
        label: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
        start,
        end,
      });
    }
    return buckets.map((b) => ({
      label: b.label,
      jumlah: riwayat.filter((r) => r.timestamp >= b.start && r.timestamp < b.end).length,
    }));
  }

  if (rentang === "mingguan") {
    const buckets: { label: string; start: number; end: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      buckets.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        start: start.getTime(),
        end: end.getTime(),
      });
    }
    return buckets.map((b) => ({
      label: b.label,
      jumlah: riwayat.filter((r) => r.timestamp >= b.start && r.timestamp <= b.end).length,
    }));
  }

  const buckets: { label: string; start: number; end: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.getTime();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    buckets.push({
      label: d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      start,
      end,
    });
  }
  return buckets.map((b) => ({
    label: b.label,
    jumlah: riwayat.filter((r) => r.timestamp >= b.start && r.timestamp < b.end).length,
  }));
}