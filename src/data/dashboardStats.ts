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
export function tanggalKeyDariTimestamp(ts: number): string {
  const d = new Date(ts);
  const tahun = d.getFullYear();
  const bulan = String(d.getMonth() + 1).padStart(2, "0");
  const tanggal = String(d.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${tanggal}`;
}

export interface RentangTanggal {
  mulai: string; // "YYYY-MM-DD", inklusif
  akhir: string; // "YYYY-MM-DD", inklusif
}

function formatTanggalKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tanggalDalamRentang(tanggalKey: string, rentang: RentangTanggal): boolean {
  return tanggalKey >= rentang.mulai && tanggalKey <= rentang.akhir;
}

/** Rentang preset "N Hari Terakhir", termasuk hari ini. */
export function rentangPreset(jumlahHari: number): RentangTanggal {
  const akhir = new Date();
  const mulai = new Date();
  mulai.setDate(mulai.getDate() - (jumlahHari - 1));
  return { mulai: formatTanggalKey(mulai), akhir: formatTanggalKey(akhir) };
}

/** Rentang dengan panjang sama, tepat SEBELUM rentang yang diberikan —
 *  dasar perhitungan badge "vs periode sebelumnya" (mis. 8-14 Sep jadi
 *  pembanding untuk 15-21 Sep, sama-sama 7 hari). */
export function rentangSebelumnya(rentang: RentangTanggal): RentangTanggal {
  const mulai = new Date(`${rentang.mulai}T00:00:00`);
  const akhir = new Date(`${rentang.akhir}T00:00:00`);
  const panjangHari = Math.round((akhir.getTime() - mulai.getTime()) / 86400000) + 1;

  const akhirBaru = new Date(mulai);
  akhirBaru.setDate(akhirBaru.getDate() - 1);
  const mulaiBaru = new Date(akhirBaru);
  mulaiBaru.setDate(mulaiBaru.getDate() - (panjangHari - 1));

  return { mulai: formatTanggalKey(mulaiBaru), akhir: formatTanggalKey(akhirBaru) };
}

/** Persentase perubahan sekarang vs sebelumnya. `null` artinya tidak
 *  terhingga (sebelumnya 0 tapi sekarang > 0) — tampilkan label "Baru" di
 *  UI untuk kasus ini, bukan "%". */
export function hitungPersenPerubahan(sekarang: number, sebelumnya: number): number | null {
  if (sebelumnya === 0) return sekarang === 0 ? 0 : null;
  return ((sekarang - sebelumnya) / sebelumnya) * 100;
}

/** Bangun QueueStats HANYA dari tiket dalam rentang tanggal tertentu —
 *  gabungan rekapHarian (arsip) + riwayat (live), sama seperti fungsi
 *  gabungan lain di file ini. `activeCounters`/`totalCounters` tetap
 *  status LIVE saat ini (tidak ada histori status buka/tutup per hari),
 *  jadi angka itu tidak ikut berubah sesuai rentang yang dipilih. */
export function buildQueueStatsUntukRentang(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  layananList: Layanan[],
  loketStatus: Record<string, "buka" | "tutup">,
  rentang: RentangTanggal
): QueueStats {
  let total = 0;
  let served = 0;

  rekapHarian.forEach((r) => {
    if (tanggalDalamRentang(r.tanggal, rentang)) {
      total += r.total;
      served += r.dilayani;
    }
  });

  riwayat.forEach((e) => {
    if (tanggalDalamRentang(tanggalKeyDariTimestamp(e.timestamp), rentang)) {
      total += 1;
      if (e.status === "dilayani") served += 1;
    }
  });

  return {
    total,
    served,
    waiting: Math.max(total - served, 0),
    activeCounters: layananList.filter((l) => (loketStatus[l.id] ?? "buka") === "buka").length,
    totalCounters: layananList.length,
  };
}

/** Bangun PerformanceStats HANYA dari tiket live dalam rentang tanggal
 *  tertentu. Tidak bisa memasukkan data arsip (rekap_harian) — sudah
 *  dijelaskan di buildPerformanceStats kenapa, waktu per-tiket memang
 *  tidak disimpan di tabel arsip. */
export function buildPerformanceStatsUntukRentang(
  riwayat: AntrianEvent[],
  rentang: RentangTanggal
): PerformanceStats {
  const eventsDalamRentang = riwayat.filter((e) =>
    tanggalDalamRentang(tanggalKeyDariTimestamp(e.timestamp), rentang)
  );
  return buildPerformanceStats(eventsDalamRentang);
}

/** Sama seperti buildServiceDistribution, tapi dibatasi ke satu rentang
 *  tanggal saja — dan SENGAJA TIDAK fallback ke data dummy kalau hasilnya
 *  kosong (array kosong = jujur belum ada tiket di periode itu). */
export function buildServiceDistributionUntukRentang(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  layananList: Layanan[],
  rentang: RentangTanggal
): ServiceDistributionItem[] {
  const rekapDalamRentang = rekapHarian.filter((r) => tanggalDalamRentang(r.tanggal, rentang));
  const riwayatDalamRentang = riwayat.filter((e) =>
    tanggalDalamRentang(tanggalKeyDariTimestamp(e.timestamp), rentang)
  );
  return agregasiDistribusiLayanan(rekapDalamRentang, riwayatDalamRentang, layananList);
}

/** Sama seperti buildTrendFromRekapDanRiwayat, tapi dibatasi ke satu rentang tanggal saja. */
export function buildTrendUntukRentang(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  rentang: RentangTanggal
): MonthlyTrendPoint[] {
  const rekapDalamRentang = rekapHarian.filter((r) => tanggalDalamRentang(r.tanggal, rentang));
  const riwayatDalamRentang = riwayat.filter((e) =>
    tanggalDalamRentang(tanggalKeyDariTimestamp(e.timestamp), rentang)
  );
  return buildTrendFromRekapDanRiwayat(rekapDalamRentang, riwayatDalamRentang);
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
 * Agregasi murni — TANPA fallback ke data dummy. Dipakai baik oleh
 * `buildServiceDistribution` (all-time, boleh fallback ke mock kalau
 * instalasi benar-benar baru) maupun `buildServiceDistributionUntukRentang`
 * (per rentang tanggal, TIDAK BOLEH fallback — array kosong itu jawaban
 * yang jujur kalau memang tidak ada tiket di periode yang dipilih).
 *
 * Dikelompokkan PER LOKET (nama loket, mis. "Rekam E-KTP", "Samsat
 * Digital"), BUKAN per kategori (Umum/Kependudukan/Perizinan) — supaya
 * admin bisa langsung lihat loket spesifik mana yang paling ramai.
 */
function agregasiDistribusiLayanan(
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

  return Array.from(map.entries())
    .map(([nama, jumlah]) => ({ nama, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);
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
 * CATATAN: fallback mock di fungsi ini HANYA cocok dipakai untuk tampilan
 * "sepanjang waktu" (all-time). Untuk tampilan per rentang tanggal, pakai
 * `buildServiceDistributionUntukRentang` di bawah — itu TIDAK fallback ke
 * mock, karena "kosong di rentang yang dipilih" itu beda makna dengan
 * "belum pernah ada data sama sekali".
 */
export function buildServiceDistribution(
  rekapHarian: RekapHarian[],
  riwayat: AntrianEvent[],
  layananList: Layanan[]
): ServiceDistributionItem[] {
  const hasil = agregasiDistribusiLayanan(rekapHarian, riwayat, layananList);
  return hasil.length === 0 ? mockServiceDistribution : hasil;
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