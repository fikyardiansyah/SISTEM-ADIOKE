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
}

// Data yang diisi admin lewat form "Tambah Layanan Loket". id dibuat
// otomatis dari nama (slug), jadi tidak perlu diisi manual.
export type TambahLoketInput = Omit<Layanan, "id">;

export interface QueueContextType {
  /** Daftar semua loket — sekarang dinamis (bisa nambah lewat tambahLoket) */
  layananList: Layanan[];
  counts: Record<string, number>;
  currentServing: Record<string, number>;
  loketStatus: Record<string, LoketStatus>;
  /** Setiap kali warga ambil tiket, dicatat di sini — dasar grafik & riwayat harian/mingguan/bulanan */
  riwayatAntrian: AntrianEvent[];
  /** Daftar kategori loket yang admin kelola */
  kategoriList: string[];

  ambilAntrian: (id: string) => void;
  panggilSelanjutnya: (id: string) => void;
  tutupLoket: (id: string) => void;
  bukaLoket: (id: string) => void;
  resetSemuaAntrian: () => void;
  tambahKategori: (nama: string) => void;
  /** Hapus satu tiket dari riwayat berdasarkan id-nya */
  hapusAntrian: (eventId: string) => void;
  /** Hapus seluruh tiket dalam satu hari (arsip), startOfDayTs = timestamp awal hari (00:00) */
  hapusRiwayatHari: (startOfDayTs: number) => void;
  /** Admin menambah loket baru lewat form Tambah Layanan Loket */
  tambahLoket: (data: TambahLoketInput) => void;
}

export const QueueContext = createContext<QueueContextType | null>(null);