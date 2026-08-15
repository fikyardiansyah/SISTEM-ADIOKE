import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ADMIN_STORAGE_KEY = "adioke_admin_user";

// Navbar ini dipakai di SEMUA halaman publik, TERMASUK Portal admin
// ("/admin/portal") — tampilannya harus identik dengan guest yang belum
// login. Satu-satunya perbedaan: kalau admin sedang login, tombol
// "Sign In" diganti dropdown profil (Dashboard, Display, Logout).
//
// Tombol "Sign In" mengarahkan ke halaman penuh /login (LoginPage) —
// bukan modal — supaya tampilan login konsisten dengan branding Adi Oke
// (split-screen, bukan popup kecil).
//
// Untuk halaman panel admin lain (Dashboard, Kelola Loket, Kelola Akun),
// Navbar ini TIDAK dipakai — App.tsx menyembunyikannya dan memakai header
// bawaan AdminLayout (sidebar).
export default function Navbar() {
  const navigate = useNavigate();

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Dibaca langsung saat render (bukan lewat useState + useEffect) supaya
  // tidak memicu "setState synchronously within an effect" di React 19.
  // Navbar dirender di luar <Routes>, tapi App.tsx sudah memakai
  // useLocation() sehingga App ikut re-render tiap pindah halaman — Navbar
  // sebagai child-nya otomatis ikut re-render juga, jadi nilai ini selalu
  // sinkron tanpa perlu effect tambahan.
  const adminUser = localStorage.getItem(ADMIN_STORAGE_KEY);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <header>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-12 w-12" />
          <div className="text-sm font-bold leading-tight">
            <p>KECAMATAN KUTA SELATAN</p>
            <p>KABUPATEN BADUNG</p>
          </div>
        </div>

        {adminUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-3"
            >
              <div className="text-right text-sm">
                <p className="font-semibold text-gray-800">
                  Halo, <span className="font-bold">{adminUser}</span>
                </p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-800 text-white">
                👤
              </div>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 stroke-current text-gray-500"
                fill="none"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {showProfileMenu && (
              <>
                {/* overlay transparan untuk menutup dropdown saat klik di luar */}
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/display"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Display
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-blue-800 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Sign In
          </Link>
        )}
      </div>

      <div className="bg-blue-800 flex flex-col items-center py-8 text-white">
        <img src="/images/logo-adioke.png" alt="Adi Oke" className="h-24" />
        <p className="mt-2 text-sm">Antrean Digital Online Kuta Selatan</p>
      </div>
    </header>
  );
}