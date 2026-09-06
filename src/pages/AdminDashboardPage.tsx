import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardKpiSection from "../components/dashboard/DashboardKpiSection";
import DashboardPerformanceCards from "../components/dashboard/DashboardPerformanceCards";
import DashboardRecentActivity from "../components/dashboard/DashboardRecentActivity";
import DashboardServiceDonut from "../components/dashboard/DashboardServiceDonut";
import DashboardTrendChart from "../components/dashboard/DashboardTrendChart";
import DashboardDateRangeFilter from "../components/dashboard/DashboardDateRangeFilter";
import { useQueue } from "../context/useQueue";
import type { Layanan } from "../data/layanan";
import type { AntrianEvent, RekapHarian } from "../context/QueueContext";
import {
  buildQueueStatsUntukRentang,
  buildPerformanceStatsUntukRentang,
  buildServiceDistributionUntukRentang,
  buildTrendUntukRentang,
  rentangPreset,
  rentangSebelumnya,
  hitungPersenPerubahan,
} from "../data/dashboardStats";

interface RekapPerLoket {
  loketId: string;
  nama: string;
  total: number;
  dilayani: number;
  menunggu: number;
}

interface RekapHari {
  startTs: number;
  tanggalKey: string; // "YYYY-MM-DD"
  label: string;
  total: number;
  dilayani: number;
  menunggu: number;
  perLoket: RekapPerLoket[];
  /** true kalau hari ini punya kontribusi dari tabel rekap_harian (arsip permanen) */
  diarsipkan: boolean;
  /** true kalau hari ini punya kontribusi dari riwayatAntrian (live, BISA dihapus) */
  adaLive: boolean;
  /** jumlah tiket live saja di hari ini — inilah yang akan benar-benar terhapus kalau tombol hapus ditekan */
  liveTotal: number;
}

export default function AdminDashboardPage() {
  const { layananList, loketStatus, riwayatAntrian, hapusRiwayatHari, aktivitasLog, rekapHarian } =
    useQueue();
  const [detailHari, setDetailHari] = useState<RekapHari | null>(null);
  const [rentang, setRentang] = useState(() => rentangPreset(7));

  const rentangPembanding = useMemo(() => rentangSebelumnya(rentang), [rentang]);

  const queueStats = useMemo(
    () => buildQueueStatsUntukRentang(rekapHarian, riwayatAntrian, layananList, loketStatus, rentang),
    [rekapHarian, riwayatAntrian, layananList, loketStatus, rentang]
  );
  const queueStatsSebelumnya = useMemo(
    () => buildQueueStatsUntukRentang(rekapHarian, riwayatAntrian, layananList, loketStatus, rentangPembanding),
    [rekapHarian, riwayatAntrian, layananList, loketStatus, rentangPembanding]
  );

  const performanceStats = useMemo(
    () => buildPerformanceStatsUntukRentang(riwayatAntrian, rentang),
    [riwayatAntrian, rentang]
  );
  const performanceStatsSebelumnya = useMemo(
    () => buildPerformanceStatsUntukRentang(riwayatAntrian, rentangPembanding),
    [riwayatAntrian, rentangPembanding]
  );

  // Trend badge per KPI — dihitung sekali di sini, tinggal dioper ke komponen kartu
  const trendKpi = {
    total: hitungPersenPerubahan(queueStats.total, queueStatsSebelumnya.total),
    served: hitungPersenPerubahan(queueStats.served, queueStatsSebelumnya.served),
    waiting: hitungPersenPerubahan(queueStats.waiting, queueStatsSebelumnya.waiting),
  };
  const trendPerforma = {
    rataTunggu: hitungPersenPerubahan(performanceStats.rataTungguMenit, performanceStatsSebelumnya.rataTungguMenit),
    rataPelayanan: hitungPersenPerubahan(
      performanceStats.rataPelayananMenit,
      performanceStatsSebelumnya.rataPelayananMenit
    ),
    antreanTerlama: hitungPersenPerubahan(
      performanceStats.antreanTerlamaMenit,
      performanceStatsSebelumnya.antreanTerlamaMenit
    ),
  };

  const trendData = useMemo(
    () => buildTrendUntukRentang(rekapHarian, riwayatAntrian, rentang),
    [rekapHarian, riwayatAntrian, rentang]
  );

  const serviceDistribution = useMemo(
    () => buildServiceDistributionUntukRentang(rekapHarian, riwayatAntrian, layananList, rentang),
    [rekapHarian, riwayatAntrian, layananList, rentang]
  );

  const arsipHarian = useMemo(
    () => buildArsipGabungan(rekapHarian, riwayatAntrian, layananList),
    [rekapHarian, riwayatAntrian, layananList]
  );

  const [cariTanggal, setCariTanggal] = useState("");

  const arsipHarianTampil = useMemo(() => {
    const kataKunci = cariTanggal.trim().toLowerCase();
    if (!kataKunci) return arsipHarian;
    return arsipHarian.filter((hari) => hari.label.toLowerCase().includes(kataKunci));
  }, [arsipHarian, cariTanggal]);

  const handleHapusHari = (hari: RekapHari) => {
    if (!hari.adaLive) return; // tombol sudah disabled, ini jaga-jaga tambahan

    const pesan = hari.diarsipkan
      ? `Hari ini sebagian datanya sudah diarsipkan (tidak bisa dihapus dari sini). Hanya ${hari.liveTotal} tiket LIVE yang akan dihapus — ${hari.total - hari.liveTotal} tiket arsip tetap tersimpan permanen. Lanjutkan?`
      : `Hapus seluruh arsip antrian tanggal ${hari.label} (${hari.total} tiket)?`;

    const yakin = window.confirm(pesan);
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

      <DashboardDateRangeFilter rentang={rentang} onChange={setRentang} />

      <DashboardKpiSection stats={queueStats} trend={trendKpi} />

      <DashboardPerformanceCards stats={performanceStats} trend={trendPerforma} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardTrendChart data={trendData} />
        </div>
        <DashboardServiceDonut data={serviceDistribution} />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <DashboardRecentActivity items={aktivitasLog} />

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Riwayat Antrian Harian</h2>
              <p className="mt-1 text-sm text-gray-500">Arsip antrean per hari</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cariTanggal}
                onChange={(e) => setCariTanggal(e.target.value)}
                placeholder="Cari tanggal..."
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white"
                aria-label="Cari tanggal arsip"
              />
              <span className="text-sm text-gray-400">{arsipHarianTampil.length} hari</span>
            </div>
          </div>

          {arsipHarianTampil.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">
              {cariTanggal.trim()
                ? "Tidak ada arsip yang cocok dengan pencarian tanggal ini."
                : "Belum ada arsip antrian yang tercatat."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500">
                    <th className="py-2 pr-3 font-medium">No</th>
                    <th className="py-2 pr-3 font-medium">Tanggal</th>
                    <th className="py-2 pr-3 font-medium">Total</th>
                    <th className="py-2 pr-3 font-medium">Dilayani</th>
                    <th className="py-2 pr-3 font-medium">Menunggu</th>
                    <th className="py-2 pr-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {arsipHarianTampil.map((hari, idx) => (
                    <tr key={hari.startTs} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-3 text-gray-500">{idx + 1}</td>
                      <td className="max-w-[140px] truncate py-3 pr-3 font-semibold text-gray-900" title={hari.label}>
                        {hari.label}
                        {hari.diarsipkan && (
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-500">
                            {hari.adaLive ? "Arsip + Live" : "Arsip"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-3 font-medium text-blue-600">{hari.total}</td>
                      <td className="py-3 pr-3 font-medium text-green-600">{hari.dilayani}</td>
                      <td className="py-3 pr-3 font-medium text-orange-500">{hari.menunggu}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center justify-end gap-1">
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
                            disabled={!hari.adaLive}
                            title={
                              !hari.adaLive
                                ? "Semua data hari ini sudah diarsipkan permanen, tidak ada bagian live untuk dihapus"
                                : hari.diarsipkan
                                ? `Hanya akan menghapus ${hari.liveTotal} tiket live — bagian arsip tetap tersimpan`
                                : undefined
                            }
                            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
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
      </div>

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
              {detailHari.perLoket.map((item) => (
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

/**
 * Gabungkan arsip yang tersimpan permanen di `rekap_harian` (SUDAH pernah
 * di-reset, TIDAK ikut hilang oleh "Reset Semua Antrian") dengan data LIVE
 * yang belum pernah direset (`riwayatAntrian`) — supaya "Riwayat Antrian
 * Harian" di dashboard ini tetap menumpuk terus per hari, walau tombol
 * reset ditekan berkali-kali.
 *
 * Sengaja digabung PER LOKET PER TANGGAL dulu (bukan cuma per tanggal),
 * karena `rekap_harian` sudah teragregasi per loket dari backend, dan
 * `riwayatAntrian` (live) perlu diagregasi manual di sini per tiket.
 * Kalau kebetulan ada tiket baru diambil di tanggal yang sama SETELAH
 * reset terjadi, angkanya dijumlahkan dengan benar, bukan saling menimpa.
 */
function buildArsipGabungan(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  layananList: Layanan[]
): RekapHari[] {
  const perTanggal = new Map<
    string,
    {
      startTs: number;
      diarsipkan: boolean;
      adaLive: boolean;
      liveTotal: number;
      perLoket: Map<string, RekapPerLoket>;
    }
  >();

  const namaLoket = (loketId: string) => layananList.find((l) => l.id === loketId)?.nama ?? loketId;

  const ensureHari = (tanggalKey: string) => {
    if (!perTanggal.has(tanggalKey)) {
      perTanggal.set(tanggalKey, {
        startTs: new Date(`${tanggalKey}T00:00:00`).getTime(),
        diarsipkan: false,
        adaLive: false,
        liveTotal: 0,
        perLoket: new Map(),
      });
    }
    return perTanggal.get(tanggalKey)!;
  };

  const tambahLoket = (
    tanggalKey: string,
    loketId: string,
    total: number,
    dilayani: number,
    menunggu: number
  ) => {
    const hari = ensureHari(tanggalKey);
    const existing = hari.perLoket.get(loketId) ?? {
      loketId,
      nama: namaLoket(loketId),
      total: 0,
      dilayani: 0,
      menunggu: 0,
    };
    hari.perLoket.set(loketId, {
      loketId,
      nama: namaLoket(loketId),
      total: existing.total + total,
      dilayani: existing.dilayani + dilayani,
      menunggu: existing.menunggu + menunggu,
    });
  };

  // Arsip permanen dari rekap_harian (SUDAH teragregasi per loket per tanggal)
  rekapHarian.forEach((r) => {
    const hari = ensureHari(r.tanggal);
    hari.diarsipkan = true;
    tambahLoket(r.tanggal, r.loketId, r.total, r.dilayani, r.menunggu);
  });

  // Data live yang belum pernah direset — agregasi manual per tiket
  riwayat.forEach((e) => {
    const d = new Date(e.timestamp);
    const tanggalKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

    const hari = ensureHari(tanggalKey);
    hari.adaLive = true;
    hari.liveTotal += 1;
    tambahLoket(tanggalKey, e.loketId, 1, e.status === "dilayani" ? 1 : 0, e.status === "menunggu" ? 1 : 0);
  });

  return Array.from(perTanggal.entries())
    .map(([tanggalKey, v]) => {
      const perLoket = Array.from(v.perLoket.values()).sort((a, b) => b.total - a.total);
      const total = perLoket.reduce((sum, p) => sum + p.total, 0);
      const dilayani = perLoket.reduce((sum, p) => sum + p.dilayani, 0);
      const menunggu = perLoket.reduce((sum, p) => sum + p.menunggu, 0);

      return {
        startTs: v.startTs,
        tanggalKey,
        label: new Date(`${tanggalKey}T00:00:00`).toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        total,
        dilayani,
        menunggu,
        perLoket,
        diarsipkan: v.diarsipkan,
        adaLive: v.adaLive,
        liveTotal: v.liveTotal,
      };
    })
    .sort((a, b) => b.startTs - a.startTs);
}