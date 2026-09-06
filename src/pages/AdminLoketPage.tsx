import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueue } from "../context/useQueue";

/**
 * Mainkan chime "ding-dong" pendek lewat Web Audio API (disintesis
 * langsung, tanpa file audio) — meniru bunyi pengumuman di kapal/bandara
 * sebelum suara pengumuman. Promise selesai (resolve) setelah chime habis,
 * supaya TTS bisa menyusul TEPAT setelah bunyi berhenti.
 */
function mainkanChime(volume: number): Promise<void> {
  return new Promise((resolve) => {
    const AudioCtxClass =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) {
      resolve();
      return;
    }

    const ctx = new AudioCtxClass();

    // Dua nada: tinggi dulu lalu rendah, khas chime "ding-dong"
    const nada = [
      { freq: 880, mulai: 0, durasi: 0.28 }, // "ding"
      { freq: 659, mulai: 0.3, durasi: 0.4 }, // "dong"
    ];

    nada.forEach(({ freq, mulai, durasi }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      const waktuMulai = ctx.currentTime + mulai;
      gain.gain.setValueAtTime(0, waktuMulai);
      gain.gain.linearRampToValueAtTime(0.4 * volume, waktuMulai + 0.02);
      gain.gain.linearRampToValueAtTime(0, waktuMulai + durasi);

      osc.start(waktuMulai);
      osc.stop(waktuMulai + durasi);
    });

    const totalDurasiMs = (nada[nada.length - 1].mulai + nada[nada.length - 1].durasi) * 1000;

    setTimeout(() => {
      ctx.close();
      resolve();
    }, totalDurasiMs + 150); // +150ms jeda kecil sebelum suara mulai
  });
}

/** Ucapkan nomor antrian lewat Web Speech API (Text-to-Speech browser) */
function ucapkanAntrian(nomorAntrian: string, namaLoket: string, volume: number) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // hentikan ucapan sebelumnya kalau masih berjalan

  const nomorDieja = nomorAntrian.split("").join(" ");
  const teks = `Nomor antrian ${nomorDieja}, silakan menuju ${namaLoket}`;

  const utterance = new SpeechSynthesisUtterance(teks);
  utterance.lang = "id-ID";
  utterance.rate = 0.9;
  utterance.volume = volume;
  window.speechSynthesis.speak(utterance);
}

/** Mainkan chime dulu, baru menyusul TTS setelah chime selesai */
async function umumkanAntrian(
  nomorAntrian: string,
  namaLoket: string,
  notifAktif: boolean,
  volumeUtama: number
) {
  if (!notifAktif) return;

  const volume = Math.min(100, Math.max(0, volumeUtama)) / 100;
  await mainkanChime(volume);
  ucapkanAntrian(nomorAntrian, namaLoket, volume);
}

// Halaman ini dirender DI DALAM AdminLayout (sidebar gelap + header sudah
// disediakan oleh layout), jadi di sini tidak perlu Navbar/Footer sendiri.
export default function AdminLoketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    layananList,
    counts,
    currentServing,
    loketStatus,
    panggilSelanjutnya,
    tutupLoket,
    bukaLoket,
    loketError,
    pengaturan,
  } = useQueue();
  const layanan = layananList.find((l) => l.id === id);

  if (!layanan && !loketError && layananList.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Memuat layanan...</p>
      </div>
    );
  }

  if (!layanan) {
    return (
      <div className="py-20 text-center">
        <p>Layanan tidak ditemukan.</p>
        <Link to="/admin/loket" className="text-blue-600 underline">
          Kembali ke Kelola Layanan Loket
        </Link>
      </div>
    );
  }

  const nomorSaatIni = currentServing[layanan.id] ?? 0;
  const totalDiambil = counts[layanan.id] ?? 0;
  const sisaAntrian = Math.max(totalDiambil - nomorSaatIni, 0);
  const status = loketStatus[layanan.id] ?? "buka";
  const sedangBuka = status === "buka";
  const belumAdaAntrian = nomorSaatIni === 0;

  const formatNomor = (n: number) => `${layanan.prefix}${String(n).padStart(3, "0")}`;
  const nomorAntrianText = belumAdaAntrian ? null : formatNomor(nomorSaatIni);
  const nomorBerikutnyaText = formatNomor(nomorSaatIni + 1);

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
    void umumkanAntrian(
      formatNomor(nomorSaatIni + 1),
      layanan.namaLoket,
      pengaturan.notifPanggilanAntrean,
      pengaturan.volumeUtama
    );
  };

  const handlePanggilSuara = () => {
    if (belumAdaAntrian || !nomorAntrianText) return;
    void umumkanAntrian(
      nomorAntrianText,
      layanan.namaLoket,
      pengaturan.notifPanggilanAntrean,
      pengaturan.volumeUtama
    );
  };

  const handleToggleLoket = () => {
    if (sedangBuka) {
      tutupLoket(layanan.id);
    } else {
      bukaLoket(layanan.id);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between text-sm text-gray-500">
        <span>{tanggal}</span>
        <span>{jam}</span>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-widest text-gray-500">
          NOMOR ANTRIAN SAAT INI
        </p>

        {/* Kartu nomor tiket */}
        <div className="relative mx-auto my-6 max-w-xs">
          <div
            className={`flex h-36 items-center justify-center rounded-2xl border-2 border-dashed ${
              belumAdaAntrian ? "border-gray-200 bg-gray-50" : "border-blue-200 bg-blue-50"
            }`}
          >
            {belumAdaAntrian ? (
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.6}>
                  <rect x="3" y="7" width="18" height="12" rx="2" />
                  <path strokeLinecap="round" d="M3 11h18M8 7V5h8v2" />
                </svg>
                <span className="text-sm font-medium">Belum Ada Antrian</span>
              </div>
            ) : (
              <p className="text-7xl font-extrabold leading-none tracking-tight text-blue-600">
                {nomorAntrianText}
              </p>
            )}
          </div>
          {/* lekukan kiri-kanan biar terlihat seperti tiket */}
          <div className="absolute left-0 top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-50" />
          <div className="absolute right-0 top-1/2 h-6 w-3 -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-50" />
        </div>

        <p className="font-bold text-gray-800">LOKET</p>
        <p className="mb-6 text-lg font-semibold text-gray-900">{layanan.namaLoket}</p>

        {/* Dua kotak info */}
        <div className="mx-auto grid max-w-md grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gray-100 py-4">
            <p className="text-xs font-medium tracking-wide text-gray-500">
              ANTRIAN BERIKUTNYA
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{nomorBerikutnyaText}</p>
          </div>
          <div className="rounded-2xl bg-gray-100 py-4">
            <p className="text-xs font-medium tracking-wide text-gray-500">JUMLAH ANTRIAN</p>
            <p className="mt-1 text-2xl font-bold text-gray-800">{sisaAntrian}</p>
          </div>
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Tombol aksi */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggleLoket}
            className={`flex items-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-bold transition ${
              sedangBuka
                ? "border-red-500 text-red-500 hover:bg-red-50"
                : "border-green-600 text-green-600 hover:bg-green-50"
            }`}
          >
            {sedangBuka ? <IconLockOpen className="h-4 w-4" /> : <IconLockClosed className="h-4 w-4" />}
            {sedangBuka ? "TUTUP LOKET" : "BUKA LOKET"}
          </button>

          <button
            type="button"
            onClick={handlePanggilSuara}
            disabled={belumAdaAntrian}
            className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconSpeaker className="h-4 w-4" />
            PANGGIL SUARA
          </button>

          <button
            type="button"
            onClick={handleSelanjutnya}
            disabled={!sedangBuka}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            SELANJUTNYA 
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate("/admin/loket")}
          className="text-sm text-blue-600 underline"
        >
          ← Kembali ke Kelola Layanan Loket
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Icon kecil (outline, currentColor) — tanpa library tambahan            */
/* ---------------------------------------------------------------------- */

function IconLockOpen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function IconLockClosed({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconSpeaker({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path strokeLinecap="round" d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}