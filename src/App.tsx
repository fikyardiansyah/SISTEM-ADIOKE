import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import QueuePage from "./pages/QueuePage";
import GadisManisPage from "./pages/GadisManisPage";
import SurveiKepuasanPage from "./pages/SurveiKepuasanPage";
import DisplayPage from "./pages/DisplayPage";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./pages/AdminLayout";
import AdminSurveiPage from "./pages/AdminSurveiPage";
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminLoketPage from "./pages/AdminLoketPage";
import AdminLoketListPage from "./pages/AdminLoketListPage";
import AdminTambahLoketPage from "./pages/AdminTambahLoketPage";
import AdminKategoriPage from "./pages/AdminKategoriPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminTambahAkunPage from "./pages/AdminTambahAkunPage";
import AdminLaporanPage from "./pages/AdminLaporanPage";
import AdminPengaturanPage from "./pages/AdminPengaturanPage";
import AdminProfilPage from "./pages/AdminProfilPage";
import AdminHelpCenterPage from "./pages/AdminHelpCenterPage";
import LacakAntrianPage from "./pages/LacakAntrianPage";

function App() {
  const location = useLocation();

  // Panel admin (Dashboard, Layanan Loket, Kategori, Laporan, Pengaturan,
  // Kelola Akun) punya header+sidebar sendiri di AdminLayout, jadi
  // Navbar/Footer publik disembunyikan di situ. "/admin/portal" TETAP
  // pakai Navbar publik karena sengaja dibuat identik dengan HomePage warga.
  const isAdminPanelRoute =
    location.pathname.startsWith("/admin") && location.pathname !== "/admin/portal";

  // Halaman login penuh (split-screen) punya branding sendiri, jadi Navbar
  // dan Footer publik disembunyikan di sini juga.
  const isLoginRoute = location.pathname === "/login";

  const hideNavbarFooter = isAdminPanelRoute || isLoginRoute;

  return (
    <>
      {!hideNavbarFooter && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/antrian/:id" element={<QueuePage />} />
        <Route path="/lacak/:id" element={<LacakAntrianPage />} />
        <Route path="/gadis-manis" element={<GadisManisPage />} />
        <Route path="/survey" element={<SurveiKepuasanPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin/portal" element={<AdminPortalPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="survei" element={<AdminSurveiPage />} />
          <Route path="loket" element={<AdminLoketListPage />} />
          <Route path="loket/tambah" element={<AdminTambahLoketPage />} />
          <Route path="loket/:id" element={<AdminLoketPage />} />
          <Route path="kategori" element={<AdminKategoriPage />} />
          <Route path="laporan" element={<AdminLaporanPage />} />
          <Route path="pengaturan" element={<AdminPengaturanPage />} />
          <Route path="profil" element={<AdminProfilPage />} />
          <Route path="bantuan" element={<AdminHelpCenterPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/tambah" element={<AdminTambahAkunPage />} />
        </Route>
      </Routes>

      {!hideNavbarFooter && <Footer />}
    </>
  );
}

export default App;