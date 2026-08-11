import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginModal from "./LoginModal";
import { useQueue } from "../context/useQueue";

const ADMIN_STORAGE_KEY = "adioke_admin_user";

export default function Navbar() {
  const navigate = useNavigate();
  const { resetSemuaAntrian } = useQueue();

  const [showLogin, setShowLogin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [adminUser, setAdminUser] = useState<string | null>(() =>
    localStorage.getItem(ADMIN_STORAGE_KEY)
  );

  const handleLoginSuccess = (username: string) => {
    localStorage.setItem(ADMIN_STORAGE_KEY, username);
    setAdminUser(username);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setAdminUser(null);
    setShowProfileMenu(false);
    navigate("/");
  };

  const handleResetSemuaAntrian = () => {
    if (confirm("Reset semua antrian? Semua nomor akan kembali ke 0.")) {
      resetSemuaAntrian();
    }
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

          {adminUser && (
            <button
              type="button"
              onClick={handleResetSemuaAntrian}
              className="ml-6 text-sm font-medium text-gray-700 underline hover:text-blue-700"
            >
              Reset Semua Antrian
            </button>
          )}
        </div>

        {adminUser ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              Halo, <span className="font-bold">{adminUser}</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-current" fill="none" strokeWidth={2}>
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
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="rounded-full bg-blue-800 px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Sign In
          </button>
        )}
      </div>

      <div className="bg-blue-800 flex flex-col items-center py-8 text-white">
        <img src="/images/logo-adioke.png" alt="Adi Oke" className="h-24" />
        <p className="mt-2 text-sm">Antrean Digital Online Kuta Selatan</p>
      </div>

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onSuccess={handleLoginSuccess} />
      )}
    </header>
  );
}