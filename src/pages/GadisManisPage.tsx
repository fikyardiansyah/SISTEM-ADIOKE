// import { Link } from "react-router-dom";

interface DownloadItem {
  label: string;
  file: string;
}

const downloadForms: DownloadItem[] = [
  { label: "SURAT PERNYATAAN AHLI WARIS", file: "/files/surat-pernyataan-ahli-waris.pdf" },
  { label: "SURAT PERNYATAAN HIBAH", file: "/files/surat-pernyataan-hibah.pdf" },
  { label: "SURAT PERNYATAAN PEMBAGIAN WARIS (SERTIPIKAT BERSAMA)", file: "/files/surat-pernyataan-pembagian-waris-sertipikat-bersama.pdf" },
  { label: "SURAT PERNYATAAN PEMBAGIAN WARIS", file: "/files/surat-pernyataan-pembagian-waris.pdf" },
  { label: "SURAT PERNYATAAN SILSILAH KELUARGA", file: "/files/surat-pernyataan-silsilah-keluarga.pdf" },
  { label: "SURAT PERNYATAAN TIDAK KEBERATAN", file: "/files/surat-pernyataan-tidak-keberatan.pdf" },
];

const kelengkapan: string[] = [
  "Fotocopi KTP/Kartu Keluarga/dokumen kependudukan Pewaris lainnya",
  "Fotocopi Akta Kematian Pewaris",
  "Fotocopi Akta Perkawinan Pewaris atau dokumen lain yang dipersamakan",
  "Fotocopi Akta Kematian Ahli Waris (apabila Ahli Waris meninggal dunia)",
  "Fotocopi Akta Kelahiran Ahli Waris",
  "Fotocopi KTP Ahli Waris",
  "Fotocopi Kartu Keluarga Ahli Waris",
  "Fotocopi KTP 2 (dua) orang saksi",
  "Fotocopi Sertipikat atau Pipil",
  "Fotocopi SPPT",
  "Fotocopi KTP pemilik Sertipikat (apabila Sertipikat bersama)",
  "Surat Keterangan beda nama (apabila terdapat perbedaan nama pada KTP dan Sertipikat)",
  "Putusan Pengadilan Pengangkatan Anak (apabila Ahli Waris adalah anak angkat)",
  "Surat Pernyataan kebenaran semua kelengkapan dokumen menjadi tanggung jawab pemohon",
];

const persyaratan: string[] = [
  "Surat Pernyataan ditandatangani oleh semua ahli waris di atas materai 10.000 beserta dengan saksi-saksi",
  "Nama dan tanda tangan yang tercantum pada surat pernyataan harus sesuai dengan KTP yang dilampirkan",
  "Objek yang diwariskan harus sesuai dengan yang tertera pada sertipikat yang dilampirkan",
  "Surat Keterangan/Akta Kematian semua yang sudah meninggal (alm.) termasuk jika ada yang mati kecil",
  "Khusus bagi Silsilah dan Waris dengan kelengkapan sertipikat bersama, maka pada surat pernyataan Waris dan pernyataan Pembagian Waris (apabila ada) wajib membubuhkan tanda tangan menyetujui dari nama-nama yang tertera pada sertipikat dengan melampirkan fotocopi KTP masing-masing nama tersebut",
  "Bagi Ahli Waris yang memiliki KTP diluar kecamatan, berkas pernyataan agar diketahui oleh masing-masing Pejabat yang mewilayahi",
  "Isi Surat pernyataan dan tanda tangan pejabat yang mengetahui wajib berada pada 1 (satu) lembar kertas yang sama",
  "Bagi Ahli Waris yang berumur dibawah 17 tahun agar diwalikan oleh salah orang tua kandung atau saudara kandung yang lebih tua atau kerabat dari ayah yang dibuktikan dengan Surat Pernyataan Perwalian",
];

export default function GadisManisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header sederhana ala instansi */}
      {/* <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-12 w-12" />
          <div className="text-sm font-bold leading-tight">
            <p>KECAMATAN KUTA SELATAN</p>
            <p>KABUPATEN BADUNG</p>
          </div>
        </div>
      </header> */}

      {/* Judul Gadis Manis */}
      <section className="border-b border-gray-200 bg-gray-50 py-8 text-center">
        <img
          src="/images/icon-gadis-manis.png"
          alt="Gadis Manis"
          className="mx-auto h-20 w-20 rounded-full object-cover"
        />
        <p className="mt-3 text-sm text-gray-600">
          Gerai Pengaduan dan Konsultasi Masalah Silsilah dan Waris
        </p>
      </section>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {/* Dasar hukum */}
        <p className="text-center text-sm font-semibold uppercase leading-relaxed text-gray-800">
          Peraturan Menteri Agraria dan Tata Ruang/ Kepala Badan Pertanahan Nasional Republik
          Indonesia Nomor 16 Tahun 2021 Tentang Perubahan Ketiga Atas Peraturan Menteri Negara
          Agraria/ Kepala Badan Pertanahan Nasional Nomor 3 Tahun 1997 Tentang Ketentuan
          Pelaksanaan Peraturan Pemerintah Nomor 24 Tahun 1997 Tentang Pendaftaran Tanah
        </p>

        <h2 className="mt-8 text-center text-xl font-bold">PASAL 111</h2>

        <ol className="mt-4 list-decimal space-y-2 pl-6 text-sm text-gray-800">
          <li>
            Permohonan Pendaftaran peralihan Hak Atas Tanah atau Hak Milik Atas Satuan Rumah Susun 
            diajukan oleh ahli waris atas kuasanya dengan melampirkan :
            <ol className="mt-2 list-[lower-alpha] space-y-1 pl-6">
              <li>Sertipikat Hak Atas Tanah atau Sertipikat Hak Milik Atas Satuan Rumah Susun atas nama pewaris atau alat bukti pemilik tanah lainnya;</li>
              <li>
                Surat kematian atas nama pemegang hak yang tercantum dalam Sertipikat yang
                bersangkutan dari kepala desa/lurah tempat tinggal pewaris waktu meninggal dunia,
                rumah sakit, petugas kesehatan, atau instansi lain yang berwenang;
              </li>
              <li>
                Surat tanda bukti sebagai ahli waris dapat berupa:
                <ol className="mt-2 list-decimal space-y-1 pl-6">
                  <li>Wasiat dan pewaris;</li>
                  <li>Putusan pengadilan;</li>
                  <li>Penetapan hakim/ketua pengadilan;</li>
                  <li className="font-semibold">
                    Surat pernyataan ahli waris yang dibuat oleh para ahli waris dengan disaksikan
                    oleh 2 (dua) orang saksi dan diketahui oleh kepala desa/lurah dan camat tempat
                    tinggal pewaris pada waktu meninggal dunia
                  </li>
                  <li>Akte keterangan hak mewaris dari Notaris yang berkedudukan di tempat tinggal pewaris pada waktu meninggal dunia; atau</li>
                  <li>Surat keterangan waris dari Balai Harta Peninggalan.</li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>

        {/* Kelengkapan & Persyaratan */}
        <h2 className="mt-12 text-center text-lg font-bold">
          KELENGKAPAN DAN PERSYARATAN
          <br />
          WARKAH PERTANAHAN/SILSILAH DAN PERNYATAAN WARIS
        </h2>

        <div className="mt-6">
          <p className="font-bold">KELENGKAPAN</p>
          <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-gray-800">
            {kelengkapan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="mt-8">
          <p className="font-bold">PERSYARATAN</p>
          <ol className="mt-2 list-decimal space-y-1 pl-6 text-sm text-gray-800">
            {persyaratan.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        {/* Download Form */}
        <h3 className="mt-12 text-center text-base font-bold">Download Form Surat Pernyataan</h3>

        <div className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          {downloadForms.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-4">
              <span className="text-sm font-medium text-gray-800">{item.label}</span>
              <a
                href={item.file}
                download
                className="shrink-0 rounded-md bg-blue-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Download
              </a>
            </div>
          ))}
        </div>

        {/* Kontak */}
        <div className="mt-12 text-center">
          <p className="font-semibold text-gray-800">
            Silahkan Hubungi Nomor Berikut Untuk Informasi Lebih Lengkap
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.79 14.11c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11-.41-.13-.94-.3-1.62-.59-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09.99-2.38.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.97.88 2.11.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.24.09 1.53.72 1.79.85.26.14.44.21.5.32.07.11.07.65-.17 1.33z" />
              </svg>
            </span>
            <div className="text-left text-sm">
              <a href="https://wa.me/6281239646234" className="block text-blue-700 hover:underline">Marta 081239646234</a>
              <a href="https://wa.me/6285855837841" className="block text-blue-700 hover:underline">Artana 085855837412</a>
            </div>
          </div>
        </div>

        {/* <div className="mt-10 text-center">
          <Link to="/" className="text-sm text-blue-700 hover:underline">
            &larr; Kembali ke Halaman Layanan
          </Link>
        </div> */}
      </main>
    </div>
  );
}