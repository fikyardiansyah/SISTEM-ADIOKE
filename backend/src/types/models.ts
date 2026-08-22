import type { RowDataPacket } from "mysql2";

export type LoketStatus = "buka" | "tutup";
export type StatusTiket = "menunggu" | "dilayani";
export type PeranAkun = "Super Admin" | "Admin" | "Petugas";
export type StatusAkun = "Aktif" | "Tidak Aktif";

export interface LayananRow extends RowDataPacket {
  id: string;
  nama: string;
  nama_loket: string;
  prefix: string;
  jumlah_antrian_awal: number;
  icon: string;
  kategori: string | null;
  deskripsi: string | null;
  variant: "biru" | "merah";
  status: LoketStatus;
  counter_terakhir: number;
  created_at: string;
  updated_at: string;
}

export interface KategoriRow extends RowDataPacket {
  id: number; 
  nama: string;
  icon: string;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
}

export interface AntrianRow extends RowDataPacket {
  id: string;
  loket_id: string;
  nomor_tiket: string;
  status: StatusTiket;
  waktu_ambil: string;
  waktu_dilayani: string | null;
  created_at: string;
}

export interface SurveiRow extends RowDataPacket {
  id: string;
  nama: string | null;
  saran: string | null;
  created_at: string;
}

export interface SurveiRatingRow extends RowDataPacket {
  id: number;
  survei_id: string;
  pertanyaan_id: number;
  rating: number;
}

// TIDAK ada password_hash di sini — auth (password, sesi login) sepenuhnya
// ditangani Supabase Auth. Tabel `users` di MySQL cuma profil (nama, peran,
// status), ditautkan ke akun Supabase lewat `supabase_uid`.
export interface UserRow extends RowDataPacket {
  id: string;
  supabase_uid: string;
  nama: string;
  email: string;
  username: string;
  peran: PeranAkun;
  status: StatusAkun;
  login_terakhir: string | null;
  created_at: string;
  updated_at: string;
}

export interface RingkasanLoketRow extends RowDataPacket {
  id: string;
  nama: string;
  kategori: string | null;
  status: LoketStatus;
  total_antrian: number;
  dilayani: number;
  menunggu: number;
}

export interface AktivitasRow extends RowDataPacket {
  id: string;
  pesan: string;
  detail: string | null;
  waktu: string;
}

export interface RekapHarianRow extends RowDataPacket {
  id: number;
  tanggal: string;   // format "YYYY-MM-DD"
  loket_id: string;
  total: number;
  dilayani: number;
  menunggu: number;
  created_at: string;
}