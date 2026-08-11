import { useState } from "react";

interface RatingQuestion {
  id: number;
  pertanyaan: string;
}

const ratingQuestions: RatingQuestion[] = [
  { id: 1, pertanyaan: "Seberapa mudah Anda menemukan informasi yang dibutuhkan pada website ini?" },
  { id: 2, pertanyaan: "Seberapa puas Anda terhadap kemudahan penggunaan fitur-fitur layanan yang tersedia pada website?" },
  { id: 3, pertanyaan: "Seberapa puas Anda terhadap kecepatan akses dan kinerja website saat digunakan?" },
  { id: 4, pertanyaan: "Apakah informasi yang tersedia pada website ini lengkap, jelas, dan mudah dipahami?" },
  { id: 5, pertanyaan: "Secara keseluruhan, seberapa puas Anda terhadap kualitas layanan website pemerintah ini?" },
];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-8 w-8 transition ${filled ? "fill-yellow-400 stroke-yellow-400" : "fill-none stroke-gray-300"}`}
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 2.5l2.95 6.28 6.93.6-5.24 4.6 1.57 6.79L12 17.02l-6.21 3.75 1.57-6.79-5.24-4.6 6.93-.6L12 2.5z"
      />
    </svg>
  );
}

export default function SurveiKepuasanPage() {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hovered, setHovered] = useState<Record<number, number>>({});
  const [saran, setSaran] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleRate = (id: number, value: number) => {
    setRatings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    const belumDiisi = ratingQuestions.some((q) => !ratings[q.id]);
    if (belumDiisi) {
      setError("Mohon lengkapi semua penilaian bertanda (*) sebelum mengirim.");
      return;
    }
    setError("");
    // TODO: kirim data (ratings, saran) ke backend/API jika sudah tersedia
    console.log("Survei dikirim:", { ratings, saran });
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <img
            src="/images/logo-badung.png"
            alt="Logo Instansi"
            className="h-20 w-20 object-contain"
          />
          <p className="mt-4 text-xs font-bold tracking-wide text-indigo-600">
            WEBSITE PERANGKAT DAERAH
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
            Dinas Komunikasi dan Informatika
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Survei Kepuasan Layanan Website Perangkat Daerah
          </h1>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
            <p className="text-lg font-semibold text-green-700">Terima kasih!</p>
            <p className="mt-2 text-sm text-green-700">
              Survei Anda berhasil dikirim. Pendapat Anda sangat berarti bagi kami.
            </p>
          </div>
        ) : (
          <>
            {/* Pertanyaan rating */}
            <div className="mt-8 flex flex-col gap-5">
              {ratingQuestions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-indigo-100 bg-white px-6 py-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                      {q.id}
                    </span>
                    <p className="text-base font-medium text-gray-900">
                      {q.pertanyaan} <span className="text-red-500">*</span>
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 pl-9">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleRate(q.id, value)}
                        onMouseEnter={() => setHovered((prev) => ({ ...prev, [q.id]: value }))}
                        onMouseLeave={() => setHovered((prev) => ({ ...prev, [q.id]: 0 }))}
                        aria-label={`Beri rating ${value}`}
                      >
                        <StarIcon filled={(hovered[q.id] || ratings[q.id] || 0) >= value} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-400">
                      {ratings[q.id] ? `${ratings[q.id]} / 5` : "Pilih Rating"}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pertanyaan saran (teks bebas) */}
              <div className="rounded-2xl border border-indigo-100 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    6
                  </span>
                  <p className="text-base font-medium text-gray-900">
                    Apa saran atau masukan Anda untuk meningkatkan kualitas layanan website
                    pemerintah ini?
                  </p>
                </div>
                <div className="mt-3 pl-9">
                  <input
                    type="text"
                    value={saran}
                    onChange={(e) => setSaran(e.target.value)}
                    placeholder="Ketik jawaban Anda..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm font-medium text-red-500">{error}</p>
            )}

            {/* Tombol kirim */}
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
              Kirim Survei
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              Terima kasih telah berpartisipasi. Pendapat Anda sangat berarti bagi kami.
            </p>
          </>
        )}
      </div>
    </main>
  );
}