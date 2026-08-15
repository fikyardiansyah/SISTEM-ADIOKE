import { useState } from "react";
import { useQueue } from "../context/useQueue";

export default function AdminKategoriPage() {
  const { kategoriList, tambahKategori } = useQueue();
  const [kategoriBaru, setKategoriBaru] = useState("");

  const handleTambahKategori = (e: React.FormEvent) => {
    e.preventDefault();
    tambahKategori(kategoriBaru);
    setKategoriBaru("");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Kategori Layanan</h1>
      <p className="text-sm text-gray-500 max-w-2xl">
        Kategori ini digunakan untuk mengelompokkan loket layanan yang tampil di halaman Portal
        dan Antrean warga.
      </p>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <form onSubmit={handleTambahKategori} className="mb-4 flex max-w-md gap-2">
          <input
            type="text"
            value={kategoriBaru}
            onChange={(e) => setKategoriBaru(e.target.value)}
            placeholder="Nama kategori baru"
            className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Tambah
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {kategoriList.map((k) => (
            <span
              key={k}
              className="rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}