export interface Layanan {
  id: string;
  nama: string;
  namaLoket: string;
  prefix: string;
  jumlahAntrianAwal: number;
  icon: string;
  kategori?: string;
  deskripsi?: string;
  variant: "biru" | "merah";
}

export const layananList: Layanan[] = [
  { id: "ektp-kia", nama: "E-KTP & KIA", namaLoket: "LAYANAN E-KTP & KIA", prefix: "E", jumlahAntrianAwal: 0, icon: "/images/icon-ektp.png", kategori: "Kependudukan", variant: "biru" },
  { id: "samsat-digital", nama: "Samsat Digital", namaLoket: "LAYANAN SAMSAT DIGITAL", prefix: "S", jumlahAntrianAwal: 0, icon: "/images/icon-samsat.png", kategori: "Umum", variant: "biru" },
  { id: "kependudukan", nama: "Kependudukan", namaLoket: "LAYANAN KEPENDUDUKAN", prefix: "K", jumlahAntrianAwal: 0, icon: "/images/icon-kependudukan.png", kategori: "Kependudukan", variant: "biru" },
  { id: "oss", nama: "OSS", namaLoket: "LAYANAN OSS", prefix: "O", jumlahAntrianAwal: 0, icon: "/images/icon-oss.png", kategori: "Perizinan", variant: "biru" },
  { id: "warkah-perwalian", nama: "Warkah & Perwalian", namaLoket: "LAYANAN WARKAH & PERWALIAN", prefix: "W", jumlahAntrianAwal: 0, icon: "/images/icon-warkah.png", kategori: "Umum", variant: "biru" },
  { id: "rekam-ektp", nama: "Rekam E-KTP", namaLoket: "LAYANAN REKAM E-KTP", prefix: "R", jumlahAntrianAwal: 0, icon: "/images/icon-rekam-ektp.png", kategori: "Kependudukan", variant: "biru" },
];

export interface LayananLainnya {
  nama: string;
  deskripsi?: string;
  icon: string;
  variant: "merah";
  link: string;
}

export const layananLainnya: LayananLainnya[] = [
  { nama: "Survey Kepuasan Masyarakat", icon: "/images/icon-survey.png", variant: "merah", link: "/survey" },
  { nama: "GADIS MANIS", deskripsi: "Gerai Pengaduan dan Konsultasi Masalah Silsilah dan Waris", icon: "/images/icon-gadis-manis.png", variant: "merah", link: "/gadis-manis" },
];