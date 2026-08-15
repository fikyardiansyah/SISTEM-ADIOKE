import { useNavigate } from "react-router-dom";
import { layananList } from "../data/layanan";
import { useQueue } from "../context/useQueue";

/**
 * Portal khusus ADMIN (dirender di dalam Layout yang sudah membungkus
 * Navbar + Footer di App.tsx — sama seperti HomePage). Bedanya dengan
 * HomePage (untuk warga):
 * - Admin TIDAK mengambil nomor antrian baru di sini.
 * - Klik salah satu loket akan membawa admin ke panel panggil antrian
 *   (AdminLoketPage) untuk loket tersebut.
 */
export default function AdminPortalPage() {
  const navigate = useNavigate();
  const { counts } = useQueue();

  const handlePilihLoket = (id: string) => {
    navigate(`/admin/loket/${id}`);
  };

  return (
      <main className="max-w-10xl mx-auto px-4 py-10">
        <h1 className="text-center text-2xl font-bold mb-8">PILIH LAYANAN</h1>

        <div className="flex flex-col gap-6">
          {layananList.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePilihLoket(item.id)}
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
        </div>
      </main>
  );
}