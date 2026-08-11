import { Link, useNavigate } from "react-router-dom";
import { layananList, layananLainnya } from "../data/layanan";
import { useQueue } from "../context/useQueue";

const ADMIN_STORAGE_KEY = "adioke_admin_user";

export default function HomePage() {
  const navigate = useNavigate();
  const { counts, ambilAntrian } = useQueue();
  const isAdmin = Boolean(localStorage.getItem(ADMIN_STORAGE_KEY));

  const handlePilihLayanan = (id: string) => {
    if (isAdmin) {
      // Admin masuk ke panel panggil nomor antrian loket
      navigate(`/admin/loket/${id}`);
    } else {
      // Warga mengambil nomor antrian baru lalu cetak tiket
      ambilAntrian(id);
      navigate(`/antrian/${id}`);
    }
  };

  return (
    <main className="max-w-10xl mx-auto px-4 py-10">
      <h1 className="text-center text-2xl font-bold mb-8">PILIH LAYANAN</h1>

      <div className="flex flex-col gap-6">
        {layananList.map((item) => (
          <button
            key={item.id}
            onClick={() => handlePilihLayanan(item.id)}
            className={`relative flex items-center gap-6 rounded-full py-4 pl-4 pr-8 text-left text-white shadow-md transition hover:brightness-110 ${
              item.variant === "biru" ? "bg-blue-600" : "bg-red-500"
            }`}
          >
            <img
              src={item.icon}
              alt={item.nama}
              className="h-28 w-28 shrink-0 rounded-full border-4 border-white bg-white object-cover shadow"
            />
            <div>
              <span className="text-sm opacity-90">LOKET</span>
              <p className="text-2xl font-bold leading-tight">{item.nama}</p>
              <p className="text-base mt-1">Jumlah Antrian {counts[item.id]}</p>
            </div>
          </button>
        ))}

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