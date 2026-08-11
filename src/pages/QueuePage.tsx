import { useParams, Link } from "react-router-dom";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

export default function QueuePage() {
  const { id } = useParams();
  const { counts } = useQueue();
  const layanan = layananList.find((l) => l.id === id);

  if (!layanan) {
    return (
      <main className="text-center py-20">
        <p>Layanan tidak ditemukan.</p>
        <Link to="/" className="text-blue-600 underline">Kembali ke Beranda</Link>
      </main>
    );
  }

  const nomorUrut = counts[layanan.id] ?? 0;
  const nomorAntrian = `${layanan.prefix}${String(nomorUrut).padStart(3, "0")}`;

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const jam = now.toLocaleTimeString("id-ID", { hour12: false });

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-center">
      <div className="flex justify-between text-sm text-gray-600 mb-10">
        <span>{tanggal}</span>
        <span>{jam}</span>
      </div>

      <p className="text-sm tracking-wide">NOMOR ANTRIAN ANDA</p>
      <p className="text-7xl font-bold text-blue-600 my-4">{nomorAntrian}</p>

      <p className="font-bold mt-8">LOKET</p>
      <p>{layanan.namaLoket}</p>
      <p className="mt-2">Jumlah Antrian {nomorUrut}</p>

      <hr className="my-8" />
      <p className="mb-6">Terima kasih atas kunjungannya</p>

      <button
        onClick={() => window.print()}
        className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:brightness-110"
      >
        ⬇ UNDUH NOMOR ANTRIAN
      </button>

      <div className="mt-6">
        <Link to="/" className="text-blue-600 underline">← Kembali ke Beranda</Link>
      </div>
    </main>
  );
}