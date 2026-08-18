import { useState, type SVGProps } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueue } from "../context/useQueue";
import LoginModal from "../components/LoginModal";
import { getAdminSession, clearAdminSession, type AdminSession } from "../lib/auth";

/* ----------------------------------------------------------------------
 * Icon set — outline monokrom, pakai stroke="currentColor" supaya warnanya
 * otomatis ikut warna teks parent (abu-abu saat idle, putih saat
 * aktif/hover). Tidak butuh library ikon tambahan.
 * ------------------------------------------------------------------- */
type IconProps = SVGProps<SVGSVGElement>;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconDashboard(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconLoket(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M3 21h18" />
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 9h.01M15 9h.01M12 9h.01" />
    </svg>
  );
}

function IconUsers(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.5 20c.2-2.6 1.9-4.6 4-5.2" />
    </svg>
  );
}

function IconTag(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M20.6 12.6 12.4 3.4A2 2 0 0 0 11 3H5a2 2 0 0 0-2 2v6c0 .5.2 1 .6 1.4l8.2 9.2a2 2 0 0 0 2.8.1l6-6a2 2 0 0 0-.1-2.9Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </svg>
  );
}

function IconLogout(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function IconChevronDown(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function IconBuilding(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 7h1M12 7h1M16 7h1M8 11h1M12 11h1M16 11h1" />
    </svg>
  );
}

function IconMonitor(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function IconMenu(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function IconClose(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconHelp(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.2a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2 1-1.2 1.9" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function IconBell(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function IconChart(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

function IconGear(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function IconChevronRight(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function IconStar(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3.5l2.4 5.1 5.6.5-4.2 3.7 1.3 5.5L12 15.5l-5.1 2.8 1.3-5.5-4.2-3.7 5.6-.5L12 3.5z" />
    </svg>
  );
}

function IconLayers(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 16l9 5 9-5" />
    </svg>
  );
}

function IconIdCard(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11.5" r="2" />
      <path d="M5.5 16.5c.5-1.8 1.7-2.5 3-2.5s2.5.7 3 2.5" />
      <path d="M14.5 10h4M14.5 13h4" />
    </svg>
  );
}

function IconStamp(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M9 3h6l1 5H8l1-5Z" />
      <path d="M8 8h8l1.5 5h-11L8 8Z" />
      <path d="M4 21h16" />
      <path d="M6.5 21v-3.5c0-.8.7-1.5 1.5-1.5h8c.8 0 1.5.7 1.5 1.5V21" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */

// Menu utama — urutan & label mengikuti mockup terbaru.
// "Layanan Loket" punya submenu (dropdown) berisi KATEGORI loket (Umum,
// Kependudukan, Perizinan) — bukan lagi "Semua Loket"/"Tambah Loket".
// item.to tetap disediakan supaya mode sidebar dipersempit (collapsed)
// bisa langsung navigasi ke /admin/loket tanpa perlu expand dropdown.
const menuUtama = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  {
    to: "/admin/loket",
    label: "Layanan Loket",
    icon: IconLoket,
    children: [
      { to: "/admin/loket?kategori=Umum", label: "Umum", icon: IconLayers },
      { to: "/admin/loket?kategori=Kependudukan", label: "Kependudukan", icon: IconIdCard },
      { to: "/admin/loket?kategori=Perizinan", label: "Perizinan", icon: IconStamp },
    ],
  },
  { to: "/admin/kategori", label: "Kategori Layanan", icon: IconTag },
  { to: "/admin/survei", label: "Survei Kepuasan", icon: IconStar },
  { to: "/admin/laporan", label: "Laporan", icon: IconChart },
];

// Grup "Pengaturan" — Kelola Akun dipindah ke sini, posisi ditukar dengan
// Kategori Layanan (yang sekarang jadi menu utama).
const menuPengaturan = [
  { to: "/admin/pengaturan", label: "Pengaturan", icon: IconGear },
  { to: "/admin/users", label: "Kelola Akun", icon: IconUsers },
];

const profileMenu = [
  { to: "/admin/profil", label: "Profil", icon: IconUser },
  { to: "/admin/portal", label: "Portal", icon: IconBuilding },
  { to: "/display", label: "Display", icon: IconMonitor },
];

function formatWaktuRelatif(waktu: number): string {
  const detik = Math.floor((Date.now() - waktu) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit yang lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam yang lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari yang lalu`;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession());
  const { aktivitasLog, refetchAdminData } = useQueue();

  // Dropdown "Layanan Loket" di sidebar — otomatis terbuka kalau sedang
  // berada di salah satu halamannya (/admin/loket atau /admin/loket/tambah),
  // tapi setelah itu bisa ditutup/dibuka manual dan tidak dipaksa nutup lagi.
  // Dropdown "Layanan Loket" di sidebar — kalau belum pernah diklik manual
  // (loketMenuOverride masih null), ikuti status route (otomatis terbuka
  // saat berada di /admin/loket atau /admin/loket/tambah). Setelah user
  // klik sekali, override ini yang menang, apapun rute-nya, sampai halaman
  // di-refresh. Ini dihitung langsung saat render (bukan disinkronkan lewat
  // useEffect + setState) supaya tidak kena warning "cascading renders".
  const loketChildActive = location.pathname.startsWith("/admin/loket");
  const [loketMenuOverride, setLoketMenuOverride] = useState<boolean | null>(null);
  const showLoketMenu = loketMenuOverride ?? loketChildActive;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifDibaca, setNotifDibaca] = useState(false);

  // sidebarOpen -> drawer di mobile/tablet (di bawah breakpoint lg): sidebar
  //   secara default TERSEMBUNYI (off-canvas) dan muncul sebagai overlay
  //   saat tombol hamburger di header ditekan.
  // collapsed -> di layar lg ke atas, sidebar SELALU terlihat tapi bisa
  //   dipersempit jadi mode icon-only lewat tombol hamburger yang SAMA.
  //
  // Satu tombol hamburger dipakai untuk kedua perilaku: masing-masing state
  // hanya berpengaruh pada breakpoint-nya sendiri lewat class Tailwind
  // (mis. "lg:w-20" tidak berlaku di mobile), jadi aman ditoggle bersamaan.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((v) => !v);
    setCollapsed((v) => !v);
  };

  const closeMobileSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    navigate("/");
  };

  const handleLoginSuccess = (s: AdminSession) => {
    setSession(s);
    refetchAdminData();
  };

  const adaNotifBaru = !notifDibaca && aktivitasLog.length > 0;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      collapsed ? "justify-center px-3" : ""
    } ${isActive ? "bg-white text-blue-900" : "text-blue-100 hover:bg-blue-800 hover:text-white"}`;

  // Belum login -> jangan render panel admin sama sekali, cukup modal login
  // di atas latar polos. "Tutup" pada modal akan membawa balik ke beranda
  // warga, bukan menampilkan dashboard tanpa login.
  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <LoginModal onClose={() => navigate("/")} onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Overlay gelap di belakang sidebar — hanya muncul di mobile/tablet
          saat drawer terbuka, klik di luar sidebar akan menutupnya. */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between bg-blue-900 text-white shadow-sm transition-all duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:z-auto lg:translate-x-0
          ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div>
          {/* Logo — klik untuk buka Portal */}
          <div className="flex items-center justify-between px-3 py-4">
            <Link
              to="/admin/portal"
              onClick={closeMobileSidebar}
              className={`flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 hover:bg-blue-800 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <img
                src="/images/logo-adioke.png"
                alt="Adi Oke"
                className={`shrink-0 object-contain ${collapsed ? "h-9 w-9" : "h-10 w-10"}`}
              />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight text-white">ADI OKE</p>
                  <p className="truncate text-xs text-blue-200">Antrean Digital Online</p>
                </div>
              )}
            </Link>

            {/* Tombol tutup drawer — mobile only */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="rounded-lg p-2 text-blue-200 hover:bg-blue-800 hover:text-white lg:hidden"
              aria-label="Tutup menu"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            {menuUtama.map((item) => {
              const children = "children" in item ? item.children : undefined;

              if (!children) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileSidebar}
                    className={linkClass}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && item.label}
                  </NavLink>
                );
              }

              // Item dengan submenu (mis. "Layanan Loket"). Di mode sidebar
              // dipersempit (collapsed), dropdown dimatikan — klik langsung
              // menuju item.to (list utamanya), tanpa expand submenu.
              if (collapsed) {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileSidebar}
                    className={linkClass}
                    title={item.label}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                  </NavLink>
                );
              }

              const parentActive = location.pathname.startsWith(item.to);

              return (
                <div key={item.to}>
                  <button
                    type="button"
                    onClick={() => setLoketMenuOverride(!showLoketMenu)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      parentActive ? "bg-white text-blue-900" : "text-blue-100 hover:bg-blue-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <IconChevronRight
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        showLoketMenu ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {showLoketMenu && (
                    <div className="mt-1 flex flex-col gap-1 pl-4">
                      {children.map((child) => {
                        const [childPath, childQuery] = child.to.split("?");
                        const childActive =
                          location.pathname === childPath &&
                          (childQuery ? location.search.includes(childQuery) : !location.search);

                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={closeMobileSidebar}
                            className={`flex items-center gap-3 rounded-xl py-2.5 pl-4 pr-4 text-sm font-medium transition ${
                              childActive
                                ? "bg-white text-blue-900"
                                : "text-blue-200 hover:bg-blue-800 hover:text-white"
                            }`}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {!collapsed && (
              <p className="mt-6 mb-1 px-4 text-xs font-semibold uppercase tracking-wide text-blue-300">
                Pengaturan
              </p>
            )}
            {collapsed && <div className="mt-4 border-t border-blue-800" />}
            {menuPengaturan.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobileSidebar}
                className={linkClass}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Logout — selalu di paling bawah sidebar */}
        <div className="border-t border-blue-800 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-blue-800 hover:text-red-200 ${
              collapsed ? "justify-center px-3" : ""
            }`}
            title={collapsed ? "Logout" : undefined}
          >
            <IconLogout className="h-5 w-5 shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* Area konten */}
      <div className="flex min-h-screen flex-1 flex-col bg-gray-50">
        <header className="flex items-center justify-between border-b-4 border-blue-700 bg-white px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Tombol hamburger — dipakai di SEMUA ukuran layar: di mobile
                buka/tutup drawer, di laptop persempit/perluas sidebar. */}
            <button
              type="button"
              onClick={toggleSidebar}
              className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label="Buka/tutup menu"
            >
              <IconMenu className="h-6 w-6" />
            </button>

            <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-11 w-11 shrink-0" />
            <div className="min-w-0 text-sm font-bold leading-tight text-gray-900 sm:text-base">
              <p className="truncate">KECAMATAN KUTA SELATAN</p>
              <p className="truncate">KABUPATEN BADUNG</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            {/* Bantuan — mengarah ke Help Center (/admin/bantuan) */}
            <Link
              to="/admin/bantuan"
              title="Bantuan"
              className="hidden rounded-full p-2 text-gray-500 transition hover:bg-gray-100 sm:flex"
            >
              <IconHelp className="h-5 w-5" />
            </Link>

            {/* Notifikasi — berisi aktivitas terbaru dari QueueContext */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu((v) => !v);
                  setNotifDibaca(true);
                }}
                title="Notifikasi"
                className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <IconBell className="h-5 w-5" />
                {adaNotifBaru && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>

              {showNotifMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-gray-100 bg-white py-2 shadow-lg sm:w-80">
                    <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Aktivitas Terbaru
                    </p>
                    {aktivitasLog.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-400">Belum ada aktivitas.</p>
                    ) : (
                      <ul className="max-h-72 overflow-y-auto">
                        {aktivitasLog.slice(0, 8).map((item) => (
                          <li key={item.id} className="px-4 py-2 hover:bg-gray-50">
                            <p className="text-sm leading-snug text-gray-700">
                              {item.pesan}
                              {item.detail && (
                                <span className="font-semibold text-gray-900"> {item.detail}</span>
                              )}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {formatWaktuRelatif(item.waktu)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Dropdown profile: Portal, Display, Logout */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((v) => !v)}
                className="flex items-center gap-3"
              >
                <div className="hidden text-right text-sm sm:block">
                  <p className="font-semibold text-gray-800">
                    Halo, <span className="font-bold">{session.user.nama}</span>
                  </p>
                  <p className="text-xs text-gray-500">{session.user.peran}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                  <IconUsers className="h-5 w-5" />
                </div>
                <IconChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                    {profileMenu.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <item.icon className="h-4 w-4 text-gray-500" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                    >
                      <IconLogout className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}