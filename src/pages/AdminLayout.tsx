import { useState, type SVGProps } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const ADMIN_STORAGE_KEY = "adioke_admin_user";

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

function IconChevronsLeft(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
    </svg>
  );
}

/* ---------------------------------------------------------------------- */

const menuUtama = [
  { to: "/admin/dashboard", label: "Dashboard", icon: IconDashboard },
  { to: "/admin/loket", label: "Kelola Layanan Loket", icon: IconLoket },
];

const menuPengaturan = [
  { to: "/admin/users", label: "Kelola Akun", icon: IconUsers },
  { to: "/admin/kategori", label: "Kategori Layanan", icon: IconTag },
];

const profileMenu = [
  { to: "/admin/portal", label: "Portal", icon: IconBuilding },
  { to: "/display", label: "Display", icon: IconMonitor },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const adminUser = localStorage.getItem(ADMIN_STORAGE_KEY);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // sidebarOpen -> drawer di mobile/tablet (di bawah breakpoint lg): sidebar
  //   secara default TERSEMBUNYI (off-canvas) dan muncul sebagai overlay
  //   saat tombol hamburger di header ditekan.
  // collapsed -> di layar lg ke atas, sidebar SELALU terlihat tapi bisa
  //   dipersempit jadi mode icon-only lewat tombol panah di sidebar.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    navigate("/");
  };

  const closeMobileSidebar = () => setSidebarOpen(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
      collapsed ? "justify-center px-3" : ""
    } ${isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`;

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
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between bg-slate-900 text-white transition-all duration-200 ease-in-out
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
              className={`flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-800 ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-bold">
                AO
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate font-bold leading-tight">ADI OKE</p>
                  <p className="truncate text-xs text-slate-400">Antrean Digital Online</p>
                </div>
              )}
            </Link>

            {/* Tombol tutup drawer — mobile only */}
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Tutup menu"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-2 flex flex-col gap-1 px-3">
            {menuUtama.map((item) => (
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

            {!collapsed && (
              <p className="mt-6 mb-1 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pengaturan
              </p>
            )}
            {collapsed && <div className="mt-4 border-t border-slate-800" />}
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

        <div>
          {/* Tombol collapse/expand — desktop only */}
          <div className="hidden border-t border-slate-800 p-3 lg:block">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white ${
                collapsed ? "justify-center px-3" : ""
              }`}
              aria-label={collapsed ? "Perluas sidebar" : "Persempit sidebar"}
            >
              <IconChevronsLeft
                className={`h-5 w-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
              />
              {!collapsed && "Persempit"}
            </button>
          </div>

          {/* Logout — selalu di paling bawah sidebar */}
          <div className="border-t border-slate-800 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-slate-800 ${
                collapsed ? "justify-center px-3" : ""
              }`}
              title={collapsed ? "Logout" : undefined}
            >
              <IconLogout className="h-5 w-5 shrink-0" />
              {!collapsed && "Logout"}
            </button>
          </div>
        </div>
      </aside>

      {/* Area konten */}
      <div className="flex min-h-screen flex-1 flex-col bg-gray-50">
        <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* Tombol hamburger — mobile/tablet only */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Buka menu"
            >
              <IconMenu className="h-6 w-6" />
            </button>

            <img src="/images/logo-badung.png" alt="Logo Kecamatan" className="h-9 w-9 shrink-0" />
            <h1 className="truncate text-base font-bold text-gray-900 sm:text-lg">
              KECAMATAN KUTA SELATAN
            </h1>
          </div>

          {/* Dropdown profile: Portal, Display, Logout */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowProfileMenu((v) => !v)}
              className="flex items-center gap-3"
            >
              <div className="hidden text-right text-sm sm:block">
                <p className="font-semibold text-gray-800">
                  Halo, <span className="font-bold">{adminUser ?? "admin"}</span>
                </p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                <IconUsers className="h-5 w-5" />
              </div>
              <IconChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {showProfileMenu && (
              <>
                {/* overlay transparan untuk menutup dropdown saat klik di luar */}
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
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}