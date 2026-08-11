import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

/**
 * Halaman ini dimaksudkan untuk ditampilkan di layar TV/monitor ruang tunggu.
 * Menampilkan nomor antrian yang sedang dipanggil di tiap loket secara real-time.
 * Tidak perlu login untuk mengakses (bisa dibuka di layar publik).
 */
export default function DisplayPage() {
  const { currentServing, loketStatus } = useQueue();

  return (
    <main className="min-h-screen bg-blue-900 px-8 py-10 text-white">
      <h1 className="mb-10 text-center text-3xl font-bold">NOMOR ANTRIAN SEDANG DILAYANI</h1>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {layananList.map((l) => {
          const nomor = currentServing[l.id] ?? 0;
          const status = loketStatus[l.id] ?? "buka";
          const nomorText = nomor === 0 ? "-" : `${l.prefix}${String(nomor).padStart(3, "0")}`;

          return (
            <div
              key={l.id}
              className={`rounded-2xl py-8 text-center shadow-lg ${
                status === "tutup" ? "bg-gray-700 opacity-60" : "bg-blue-800"
              }`}
            >
              <p className="text-sm uppercase tracking-wide opacity-80">{l.nama}</p>
              <p className="mt-2 text-6xl font-bold">{nomorText}</p>
              {status === "tutup" && (
                <p className="mt-2 text-xs uppercase tracking-wide text-red-300">Loket Tutup</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}