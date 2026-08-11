import { useParams, Link, useNavigate } from "react-router-dom";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

/** Ucapkan nomor antrian lewat Web Speech API (Text-to-Speech browser) */
function ucapkanAntrian(nomorAntrian: string, namaLoket: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // hentikan ucapan sebelumnya kalau masih berjalan

  // eja per-karakter supaya lebih jelas didengar, mis. "K 0 0 4"
  const nomorDieja = nomorAntrian.split("").join(" ");
  const teks = `Nomor antrian ${nomorDieja}, silakan menuju ${namaLoket}`;

  const utterance = new SpeechSynthesisUtterance(teks);
  utterance.lang = "id-ID";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function AdminLoketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { counts, currentServing, loketStatus, panggilSelanjutnya, tutupLoket, bukaLoket } =
    useQueue();
  const layanan = layananList.find((l) => l.id === id);

  if (!layanan) {
    return (
      <main className="text-center py-20">
        <p>Layanan tidak ditemukan.</p>
        <Link to="/" className="text-blue-600 underline">
          Kembali ke Beranda
        </Link>
      </main>
    );
  }

  const nomorSaatIni = currentServing[layanan.id] ?? 0;
  const totalDiambil = counts[layanan.id] ?? 0;
  const sisaAntrian = Math.max(totalDiambil - nomorSaatIni, 0);
  const status = loketStatus[layanan.id] ?? "buka";

  const nomorAntrianText =
    nomorSaatIni === 0 ? "-" : `${layanan.prefix}${String(nomorSaatIni).padStart(3, "0")}`;

  const now = new Date();
  const tanggal = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const jam = now.toLocaleTimeString("id-ID", { hour12: false });

  const handleSelanjutnya = () => {
    panggilSelanjutnya(layanan.id);
    const nomorBaru = nomorSaatIni + 1;
    const nomorText = `${layanan.prefix}${String(nomorBaru).padStart(3, "0")}`;
    ucapkanAntrian(nomorText, layanan.namaLoket);
  };

  const handleToggleLoket = () => {
    if (status === "buka") {
      tutupLoket(layanan.id);
    } else {
      bukaLoket(layanan.id);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 text-center">
      <div className="flex justify-between text-sm text-gray-600 mb-10">
        <span>{tanggal}</span>
        <span>{jam}</span>
      </div>

      <p className="text-sm tracking-wide">NOMOR ANTRIAN SAAT INI</p>
      <p className="text-7xl font-bold text-blue-600 my-4">{nomorAntrianText}</p>

      <p className="font-bold mt-8">LOKET</p>
      <p>{layanan.namaLoket}</p>

      <p className="mt-6">Nomor Antrian Berikutnya</p>
      <p>Jumlah Antrian {sisaAntrian}</p>

      <hr className="my-8" />

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleToggleLoket}
          className={`flex items-center gap-2 rounded-full border px-6 py-3 font-bold transition ${
            status === "buka"
              ? "border-red-500 text-red-500 hover:bg-red-50"
              : "border-green-600 text-green-600 hover:bg-green-50"
          }`}
        >
          {status === "buka" ? "🔓 TUTUP LOKET" : "🔒 BUKA LOKET"}
        </button>

        <button
          onClick={handleSelanjutnya}
          disabled={status === "tutup"}
          className="flex items-center gap-2 rounded-full bg-blue-800 px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          SELANJUTNYA →
        </button>
      </div>

      <div className="mt-8">
        <button onClick={() => navigate("/")} className="text-blue-600 underline">
          ← Kembali ke Beranda
        </button>
      </div>
    </main>
  );
}