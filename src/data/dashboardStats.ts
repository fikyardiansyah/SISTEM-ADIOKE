import type { AntrianEvent, RekapHarian } from "../context/QueueContext";
import type { Layanan } from "./layanan";

export interface QueueStats {
  total: number;
  served: number;
  waiting: number;
  activeCounters: number;
  totalCounters: number;
}

export interface MonthlyTrendPoint {
  bulan: string;
  total: number;
  dilayani: number;
  menunggu: number;
}

export interface ServiceDistributionItem {
  nama: string;
  jumlah: number;
}

export interface PerformanceStats {
  rataTungguMenit: number;
  rataPelayananMenit: number;
  antreanTerlamaMenit: number;
}

/** Fallback kalau BENERAN belum ada data sama sekali (arsip maupun live) — bukan mock utama */
export const mockServiceDistribution: ServiceDistributionItem[] = [
  { nama: "Administrasi Kependudukan", jumlah: 42 },
  { nama: "Pelayanan Umum", jumlah: 35 },
  { nama: "Perizinan", jumlah: 28 },
  { nama: "Layanan OSS", jumlah: 18 },
  { nama: "Layanan Lainnya", jumlah: 25 },
];

/** Mock — dipakai jika riwayat antrian belum cukup untuk hitung performa */
export const mockPerformanceStats: PerformanceStats = {
  rataTungguMenit: 12,
  rataPelayananMenit: 8,
  antreanTerlamaMenit: 27,
};

/** Kunci tanggal lokal "YYYY-MM-DD" dari sebuah timestamp — dipakai untuk
 *  mengelompokkan riwayat live per hari, format yang sama dengan kolom
 *  `tanggal` di tabel rekap_harian (DATE(waktu_ambil) di MySQL). */
function tanggalKeyDariTimestamp(ts: number): string {
  const d = new Date(ts);
  const tahun = d.getFullYear();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const tanggal = String(d.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

function labelTanggal(tanggalKey: string): string {
  return new Date(`${tanggalKey}T00:00:00`).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Gabungkan data historis yang sudah diarsipkan (`rekapHarian`, tetap ada
 * meski antrian di-reset) dengan data live yang belum pernah di-reset
 * (`riwayat`) — supaya grafik "Keseluruhan Statistik Antrean" tidak
 * "kosong lagi" setiap kali admin klik Reset Semua Antrean.
 */
export function buildTrendFromRekapDanRiwayat(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[]
): MonthlyTrendPoint[] {
  const perTanggal = new Map<string, { total: number; dilayani: number; menunggu: number }>();

  const tambah = (key: string, total: number, dilayani: number, menunggu: number) => {
    const cur = perTanggal.get(key) ?? { total: 0, dilayani: 0, menunggu: 0 };
    perTanggal.set(key, {
      total: cur.total + total,
      dilayani: cur.dilayani + dilayani,
      menunggu: cur.menunggu + menunggu,
    });
  };

  rekapHarian.forEach((r) => tambah(r.tanggal, r.total, r.dilayani, r.menunggu));

  riwayat.forEach((e) => {
    const key = tanggalKeyDariTimestamp(e.timestamp);
    tambah(key, 1, e.status === "dilayani" ? 1 : 0, e.status === "menunggu" ? 1 : 0);
  });

  return Array.from(perTanggal.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tanggalKey, v]) => ({ bulan: labelTanggal(tanggalKey), ...v }));
}

export const CHART_COLORS = {
  total: "#2563eb",
  dilayani: "#16a34a",
  menunggu: "#f97316",
} as const;

export const DONUT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#6366f1",
  "#8b5cf6",
  "#14b8a6",
  "#64748b",
];

export function buildQueueStats(
  counts: Record<string, number>,
  currentServing: Record<string, number>,
  loketStatus: Record<string, "buka" | "tutup">,
  layananList: Layanan[]
): QueueStats {
  const total = layananList.reduce((sum, l) => sum + (counts[l.id] ?? 0), 0);
  const served = layananList.reduce((sum, l) => sum + (currentServing[l.id] ?? 0), 0);
  const waiting = Math.max(total - served, 0);
  const activeCounters = layananList.filter((l) => (loketStatus[l.id] ?? "buka") === "buka").length;

  return {
    total,
    served,
    waiting,
    activeCounters,
    totalCounters: layananList.length,
  };
}

/**
 * SEBELUMNYA: fallback ke mockServiceDistribution setiap kali `riwayat`
 * (data live) kosong — termasuk tepat setelah "Reset Semua Antrian",
 * padahal datanya SEBENARNYA masih ada (sudah dipindah ke rekap_harian).
 * Itu penyebab donut chart balik nampilin angka dummy "148" alih-alih
 * angka asli yang sudah diarsipkan.
 *
 * SEKARANG: gabungkan rekapHarian (arsip permanen, TIDAK ikut kosong
 * saat reset) dengan riwayat (live) dulu — cuma jatuh ke mock kalau
 * BENERAN belum ada data sama sekali di keduanya (instalasi baru).
 *
 * Dikelompokkan PER LOKET (nama loket, mis. "Rekam E-KTP", "Samsat
 * Digital"), BUKAN per kategori (Umum/Kependudukan/Perizinan) — supaya
 * admin bisa langsung lihat loket spesifik mana yang paling ramai,
 * bukan cuma kategori besarnya yang mencampur beberapa loket jadi satu
 * angka.
 */
export function buildServiceDistribution(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  layananList: Layanan[]
): ServiceDistributionItem[] {
  const loketKeNama = new Map(layananList.map((l) => [l.id, l.nama]));
  const map = new Map<string, number>();

  // rekapHarian sudah agregat (r.total = jumlah tiket loket itu di tanggal itu)
  rekapHarian.forEach((r) => {
    const nama = loketKeNama.get(r.loketId) ?? r.loketId;
    map.set(nama, (map.get(nama) ?? 0) + r.total);
  });

  // riwayat belum agregat — satu baris = satu tiket
  riwayat.forEach((e) => {
    const nama = loketKeNama.get(e.loketId) ?? e.loketId;
    map.set(nama, (map.get(nama) ?? 0) + 1);
  });

  if (map.size === 0) return mockServiceDistribution;

  return Array.from(map.entries())
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);
}

/**
 * SEBELUMNYA: fallback ke mockPerformanceStats (angka dummy 12/8/27 menit)
 * begitu tidak ada tiket live yang sudah dilayani — termasuk tepat setelah
 * "Reset Semua Antrian". BEDA dengan distribusi layanan, ini TIDAK BISA
 * digabung dengan rekap_harian, karena tabel arsip itu cuma nyimpen angka
 * agregat (total/dilayani/menunggu) — waktu per-tiket (waktu_ambil,
 * waktu_dilayani) yang dibutuhkan buat hitung rata-rata waktu tunggu TIDAK
 * ikut disimpan di sana. Jadi begitu direset, datanya beneran hilang —
 * solusinya bukan menyambung ke sumber lain, tapi berhenti menampilkan
 * angka dummy yang menyesatkan. 0 di sini artinya jujur: "belum ada data
 * untuk dihitung", bukan estimasi.
 */
export function buildPerformanceStats(riwayat: AntrianEvent[]): PerformanceStats {
  const dilayani = riwayat.filter((e) => e.waktuDilayani !== undefined);
  if (dilayani.length === 0) {
    return { rataTungguMenit: 0, rataPelayananMenit: 0, antreanTerlamaMenit: 0 };
  }

  const waktuTunggu = dilayani.map((e) => (e.waktuDilayani! - e.timestamp) / 60000);
  const rataTungguMenit = waktuTunggu.reduce((sum, m) => sum + m, 0) / waktuTunggu.length;
  const antreanTerlamaMenit = Math.max(...waktuTunggu);

  // Estimasi waktu pelayanan: 65% dari waktu tunggu (placeholder sampai ada field selesai dilayani)
  const rataPelayananMenit = Math.max(1, Math.round(rataTungguMenit * 0.65));

  return {
    rataTungguMenit: Math.round(rataTungguMenit),
    rataPelayananMenit,
    antreanTerlamaMenit: Math.round(antreanTerlamaMenit),
  };
}