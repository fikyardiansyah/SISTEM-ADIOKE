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
import AdminPortalPage from "./pages/AdminPortalPage";
import AdminLoketPage from "./pages/AdminLoketPage";
import AdminLoketListPage from "./pages/AdminLoketListPage";
import AdminKategoriPage from "./pages/AdminKategoriPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";

function App() {
  const location = useLocation();

  // Panel admin (Dashboard, Kelola Layanan Loket, Kelola Akun, Kategori)
  // punya header+sidebar sendiri di AdminLayout, jadi Navbar/Footer publik
  // disembunyikan di situ. "/admin/portal" TETAP pakai Navbar publik
  // karena sengaja dibuat identik dengan HomePage warga.
  const isAdminPanelRoute =
    location.pathname.startsWith("/admin") && location.pathname !== "/admin/portal";

  // "/login" adalah halaman penuh (split-screen) dengan tampilannya
  // sendiri, jadi Navbar/Footer publik juga disembunyikan di sini.
  const isBareRoute = isAdminPanelRoute || location.pathname === "/login";

  return (
    <>
      {!isBareRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/antrian/:id" element={<QueuePage />} />
        <Route path="/gadis-manis" element={<GadisManisPage />} />
        <Route path="/survey" element={<SurveiKepuasanPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin/portal" element={<AdminPortalPage />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="loket" element={<AdminLoketListPage />} />
          <Route path="loket/:id" element={<AdminLoketPage />} />
          <Route path="kategori" element={<AdminKategoriPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Routes>

      {!isBareRoute && <Footer />}
    </>
  );
}

export default App; 