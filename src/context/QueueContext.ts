import { createContext } from "react";

export type LoketStatus = "buka" | "tutup";

export interface QueueContextType {
  /** Jumlah tiket yang sudah diambil warga per loket */
  counts: Record<string, number>;
  /** Nomor antrian yang sedang dipanggil/dilayani admin per loket */
  currentServing: Record<string, number>;
  /** Status buka/tutup tiap loket */
  loketStatus: Record<string, LoketStatus>;

  /** Warga mengambil nomor antrian baru */
  ambilAntrian: (id: string) => void;
  /** Admin memanggil nomor antrian berikutnya (+ akan memicu suara di halaman admin) */
  panggilSelanjutnya: (id: string) => void;
  /** Admin menutup loket */
  tutupLoket: (id: string) => void;
  /** Admin membuka kembali loket */
  bukaLoket: (id: string) => void;
  /** Reset semua antrian (counts & currentServing) ke 0, loket dibuka semua */
  resetSemuaAntrian: () => void;
}

export const QueueContext = createContext<QueueContextType | null>(null);