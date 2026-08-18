import { useSearchParams, useParams, Link } from "react-router-dom";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

/**
 * Halaman publik (tanpa login) yang dibuka lewat scan QR di tiket cetak.
 * Menampilkan nomor yang sedang dipanggil admin untuk loket tersebut,
 * plus posisi antrian warga dibanding nomor yang sedang dilayani.
 *
 * CATATAN: data antrian di app ini masih tersimpan di memori browser
 * (QueueContext), bukan di server/database. Jadi halaman ini hanya
 * ter-update otomatis kalau dibuka di TAB/BROWSER YANG SAMA dengan admin
 * yang memanggil antrian (misal kiosk & HP dalam satu jaringan tanpa
 * backend belum bisa sinkron real-time antar-device). Kalau nanti sudah
 * ada backend, tinggal ganti sumber `currentServing` di sini jadi fetch
 * ke server secara berkala (polling) atau websocket.
 */
export default function LacakAntrianPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const nomorSaya = searchParams.get("nomor") ?? "";

  const { currentServing } = useQueue();
  const layanan = layananList.find((l) => l.id === id);

  if (!layanan) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-gray-600">Layanan tidak ditemukan.</p>
        <Link to="/" className="text-blue-600 underline">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const nomorSaatIni = currentServing[layanan.id] ?? 0;
  const nomorSaatIniText =
    nomorSaatIni === 0 ? "-" : `${layanan.prefix}${String(nomorSaatIni).padStart(3, "0")}`;

  // Ambil bagian angka dari nomor tiket warga (mis. "E005" -> 5) buat
  // dibandingkan dengan nomor yang sedang dilayani.
  const angkaSaya = nomorSaya ? parseInt(nomorSaya.replace(/[^0-9]/g, ""), 10) : null;
  const sisaDidepan = angkaSaya !== null ? Math.max(angkaSaya - nomorSaatIni, 0) : null;
  const sudahLewat = angkaSaya !== null && angkaSaya < nomorSaatIni;
  const gilirannya = angkaSaya !== null && angkaSaya === nomorSaatIni;

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-widest text-gray-500">LACAK ANTRIAN</p>
        <p className="mt-1 text-lg font-bold text-gray-900">{layanan.namaLoket}</p>

        <div className="my-6 rounded-2xl bg-blue-50 py-6">
          <p className="text-xs font-medium tracking-widest text-blue-700">
            SEDANG DILAYANI SEKARANG
          </p>
          <p className="mt-1 text-6xl font-extrabold text-blue-600">{nomorSaatIniText}</p>
        </div>

        {nomorSaya && (
          <div className="rounded-2xl bg-gray-100 py-5">
            <p className="text-xs font-medium tracking-widest text-gray-500">NOMOR ANDA</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{nomorSaya}</p>

            <p className="mt-3 text-sm font-medium">
              {gilirannya && (
                <span className="text-green-600">Sekarang giliran Anda — silakan menuju loket!</span>
              )}
              {sudahLewat && (
                <span className="text-red-500">Nomor Anda sudah terlewat, hubungi petugas.</span>
              )}
              {!gilirannya && !sudahLewat && sisaDidepan !== null && (
                <span className="text-gray-600">
                  Masih ada <span className="font-bold">{sisaDidepan}</span> nomor lagi di depan Anda.
                </span>
              )}
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400">
          Halaman ini otomatis mengikuti nomor yang dipanggil petugas.
        </p>

        <div className="mt-6">
          <Link to="/" className="text-sm text-blue-600 underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}