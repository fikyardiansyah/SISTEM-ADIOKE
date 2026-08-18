import { createContext } from "react";
import type { Layanan } from "../data/layanan";

export type LoketStatus = "buka" | "tutup";
export type StatusTiket = "menunggu" | "dilayani";

export interface AntrianEvent {
  id: string; // id unik per tiket, dipakai untuk hapus/detail
  loketId: string;
  nomorTiket: string; // contoh: E001, K002, dst
  timestamp: number; // Date.now() saat tiket diambil
  status: StatusTiket;
  /** Date.now() saat tiket dipanggil/mulai dilayani — dasar hitung waktu tunggu di Laporan */
  waktuDilayani?: number;
}

// Data yang diisi admin lewat form "Tambah Layanan Loket". id dibuat
// otomatis dari nama (slug), jadi tidak perlu diisi manual.
export type TambahLoketInput = Omit<Layanan, "id">;

export type KategoriIconKey =
  | "people"
  | "building"
  | "document"
  | "tag"
  | "heart"
  | "book"
  | "briefcase";

export interface KategoriLayanan {
  nama: string;
  icon: KategoriIconKey;
  deskripsi?: string;
  updatedAt: number; // Date.now() saat dibuat/terakhir diubah
}

export interface AktivitasLog {
  id: string;
  /** Teks utama, mis. "Loket E-KTP & KIA memanggil antrean" */
  pesan: string;
  /** Bagian yang ditebalkan di UI, mis. nomor tiket "E-042" atau nama kategori */
  detail?: string;
  waktu: number; // Date.now() saat aktivitas terjadi
}

export interface SurveiSubmission {
  id: string;
  /** key = id pertanyaan (1-5), value = rating 1-5 bintang */
  ratings: Record<number, number>;
  saran?: string;
  timestamp: number;
}

export interface JamOperasionalHari {
  hari: string; // "Senin", "Selasa", ...
  buka: string; // format "HH:mm", mis. "08:00"
  tutup: string; // format "HH:mm", mis. "15:00"
  aktif: boolean;
}

export interface PengaturanSistem {
  namaInstansi: string;
  alamatLengkap: string;
  nomorTelepon: string;
  emailResmi: string;
  logoUrl: string;
  jamOperasional: JamOperasionalHari[];
  notifPanggilanAntrean: boolean;
  notifPeringatanSistem: boolean;
  volumeUtama: number; // 0-100
}

export type PeranAkun = "Super Admin" | "Admin" | "Petugas";
export type StatusAkun = "Aktif" | "Tidak Aktif";

export interface AkunAdmin {
  id: string;
  nama: string;
  email: string;
  username: string;
  peran: PeranAkun;
  status: StatusAkun;
  loginTerakhir: number | null; // Date.now() terakhir login, null kalau belum pernah
}

export type TambahAkunInput = Omit<AkunAdmin, "id" | "loginTerakhir">;

export interface QueueContextType {
  /** Daftar semua loket — sekarang diambil dari GET /api/layanan (bukan hardcode lagi) */
  layananList: Layanan[];
  counts: Record<string, number>;
  currentServing: Record<string, number>;
  loketStatus: Record<string, LoketStatus>;
  /** Pesan error kalau GET /api/layanan gagal dimuat dari server (null kalau tidak ada masalah) */
  loketError: string | null;
  /** Muat ulang riwayat antrian + aktivitas dari server — panggil ini setelah login berhasil, atau kapan saja perlu sinkron ulang */
  refetchAdminData: () => void;
  /** Setiap kali warga ambil tiket, dicatat di sini — dasar grafik & riwayat harian/mingguan/bulanan */
  riwayatAntrian: AntrianEvent[];
  /** Daftar kategori loket yang admin kelola */
  kategoriList: KategoriLayanan[];
  /** Log aktivitas terbaru (panggil antrean, tambah kategori, buka/tutup loket, dst) — terbaru duluan */
  aktivitasLog: AktivitasLog[];
  /** Semua hasil Survei Kepuasan Masyarakat yang dikirim warga, terbaru duluan */
  surveiList: SurveiSubmission[];

  /** SUDAH tersambung ke backend (POST /api/antrian) — sekarang async, bisa throw kalau gagal (mis. loket tutup) */
  ambilAntrian: (id: string) => Promise<void>;
  panggilSelanjutnya: (id: string) => void;
  tutupLoket: (id: string) => void;
  bukaLoket: (id: string) => void;
  resetSemuaAntrian: () => void;
  tambahKategori: (nama: string, extra?: { icon?: KategoriIconKey; deskripsi?: string }) => void;
  /** Hapus kategori dari daftar. Loket yang masih memakai nama kategori ini TIDAK
   *  ikut terhapus/berubah — field `kategori`-nya jadi teks bebas yang tidak lagi
   *  cocok dengan kategori manapun di kategoriList (mis. tidak muncul lagi sebagai
   *  pilihan di dropdown Tambah Loket, tapi data lama tetap utuh). */
  hapusKategori: (nama: string) => void;
  /** Hapus satu tiket dari riwayat berdasarkan id-nya */
  hapusAntrian: (eventId: string) => void;
  /** Hapus seluruh tiket dalam satu hari (arsip), startOfDayTs = timestamp awal hari (00:00) */
  hapusRiwayatHari: (startOfDayTs: number) => void;
  /** Admin menambah loket baru lewat form Tambah Layanan Loket (POST /api/layanan).
   *  statusAwal opsional, default "buka" kalau tidak diisi (toggle di form). */
  tambahLoket: (data: TambahLoketInput, statusAwal?: LoketStatus) => Promise<void>;

  /** Pengaturan sistem: profil instansi, jam operasional, notifikasi suara */
  pengaturan: PengaturanSistem;
  updatePengaturan: (data: Partial<PengaturanSistem>) => void;

  /** Daftar akun admin/petugas yang bisa mengelola sistem */
  akunList: AkunAdmin[];
  tambahAkun: (data: TambahAkunInput) => void;
  updateAkun: (id: string, patch: Partial<Omit<AkunAdmin, "id">>) => void;
  hapusAkun: (id: string) => void;

  /** Warga mengirim jawaban Survei Kepuasan Masyarakat */
  submitSurvei: (ratings: Record<number, number>, saran?: string) => void;
  /** Admin menghapus satu respons survei dari daftar */
  hapusSurvei: (id: string) => void;
}

export const QueueContext = createContext<QueueContextType | null>(null);