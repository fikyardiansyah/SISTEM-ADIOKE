import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { layananLainnya } from "../data/layanan";
import { useQueue } from "../context/useQueue";
import { getAdminSession } from "../lib/auth";

export default function HomePage() {
  const navigate = useNavigate();
  const { layananList, counts, loketStatus, loketError, ambilAntrian } = useQueue();
  const isAdmin = Boolean(getAdminSession());

  const [mengambil, setMengambil] = useState<string | null>(null);
  const [errorAmbil, setErrorAmbil] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/portal", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handlePilihLayanan = async (id: string) => {
    setErrorAmbil(null);
    setMengambil(id);
    try {
      // ambilAntrian sekarang benar-benar memanggil backend (POST
      // /api/antrian) — ditunggu dulu sampai server konfirmasi nomor
      // tiketnya, baru pindah halaman. Kalau ternyata loket baru saja
      // ditutup admin tepat sebelum klik ini diproses server, backend
      // menolak dan errornya ditangkap di sini (bukan pindah halaman
      // dengan data kosong/salah).
      await ambilAntrian(id);
      navigate(`/antrian/${id}`);
    } catch (err) {
      setErrorAmbil(err instanceof Error ? err.message : "Gagal mengambil nomor antrian.");
      setMengambil(null);
    }
  };

  if (isAdmin) return null; // sedang di-redirect, hindari render sekilas HomePage warga

  return (
    <main className="max-w-10xl mx-auto px-4 py-10">
      <h1 className="text-center text-2xl font-bold mb-8">PILIH LAYANAN</h1>

      {loketError && (
        <p className="mx-auto mb-6 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          Gagal memuat daftar layanan dari server: {loketError}
        </p>
      )}

      {errorAmbil && (
        <p className="mx-auto mb-6 max-w-xl rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          {errorAmbil}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {layananList.map((item) => {
          const status = loketStatus[item.id] ?? "buka";
          const tertutup = status === "tutup";
          const sedangProses = mengambil === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => !tertutup && !sedangProses && handlePilihLayanan(item.id)}
              disabled={tertutup || sedangProses}
              aria-disabled={tertutup || sedangProses}
              className={`relative flex items-center gap-6 rounded-full py-4 pl-4 pr-8 text-left shadow-md transition ${
                tertutup || sedangProses
                  ? "cursor-not-allowed bg-gray-300 text-gray-500 shadow-none"
                  : `text-white hover:brightness-110 ${
                      item.variant === "biru" ? "bg-blue-600" : "bg-red-500"
                    }`
              }`}
            >
              <img
                src={item.icon}
                alt={item.nama}
                className={`h-28 w-28 shrink-0 rounded-full border-4 bg-white object-cover shadow ${
                  tertutup || sedangProses ? "border-gray-200 grayscale" : "border-white"
                }`}
              />
              <div>
                <span className={`text-sm ${tertutup || sedangProses ? "text-gray-500" : "opacity-90"}`}>
                  LOKET
                </span>
                <p className="text-2xl font-bold leading-tight">{item.nama}</p>
                {tertutup ? (
                  <p className="mt-1 text-base font-semibold">Loket Sedang Tutup</p>
                ) : sedangProses ? (
                  <p className="mt-1 text-base font-semibold">Memproses...</p>
                ) : (
                  <p className="mt-1 text-base">Jumlah Antrian {counts[item.id] ?? 0}</p>
                )}
              </div>

              {tertutup && (
                <span className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-gray-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Tutup
                </span>
              )}
            </button>
          );
        })}

        {layananLainnya.map((item) => (
          <Link
            key={item.nama}
            to={item.link}
            className="flex items-center gap-6 rounded-full py-4 pl-4 pr-8 text-white shadow-md bg-red-500 transition hover:brightness-110"
          >
            <img
              src={item.icon}
              alt={item.nama}
              className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-white object-cover shadow"
            />
            <div>
              <p className="text-2xl font-bold leading-tight">{item.nama}</p>
              {item.deskripsi && <p className="text-base mt-1">{item.deskripsi}</p>}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}