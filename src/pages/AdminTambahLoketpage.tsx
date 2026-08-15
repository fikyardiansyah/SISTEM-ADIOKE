import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQueue } from "../context/useQueue";

export default function AdminTambahLoketPage() {
  const navigate = useNavigate();
  const { tambahLoket } = useQueue();

  const [nama, setNama] = useState("");
  const [namaLoket, setNamaLoket] = useState("");
  const [prefix, setPrefix] = useState("");
  const [kategori, setKategori] = useState("Umum");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !namaLoket.trim() || !prefix.trim()) {
      setError("Nama loket, nama tampilan, dan prefix wajib diisi.");
      return;
    }

    tambahLoket({
      nama: nama.trim(),
      namaLoket: namaLoket.trim(),
      prefix: prefix.trim().toUpperCase().slice(0, 1),
      jumlahAntrianAwal: 0,
      icon: "/images/icon-default-loket.png",
      variant: "biru",
      // NOTE: kalau interface `Layanan` di project kamu punya field lain yang
      // wajib diisi (misal kategori, deskripsi, dll — saya lihat tabel kamu
      // sudah pakai kolom Kategori), kirim ulang `data/layanan.ts` yang
      // sekarang biar saya sesuaikan field form ini persis dengan interface-nya.
      kategori: kategori.trim() || "Umum",
    } as never);

    navigate("/admin/loket");
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Tambah Layanan Loket</h1>
      <p className="mb-6 text-sm text-gray-400">
        Admin <span className="mx-1">›</span> Kelola Layanan Loket{" "}
        <span className="mx-1">›</span> Tambah
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Loket</label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="misal: Legalisir Dokumen"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nama Tampilan di Struk
          </label>
          <input
            type="text"
            value={namaLoket}
            onChange={(e) => setNamaLoket(e.target.value)}
            placeholder="misal: LAYANAN LEGALISIR DOKUMEN"
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Prefix Nomor (1 huruf)
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.slice(0, 1))}
              placeholder="misal: L"
              maxLength={1}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
            <input
              type="text"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              placeholder="Umum"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-500">{error}</p>}

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/loket")}
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Simpan Loket
          </button>
        </div>
      </form>
    </div>
  );
}