import { useState, type ReactElement, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconSearch(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconRocket(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M12 2c2.5 2 4 5 4 8.5 0 2-.5 3.5-1.5 5L12 18l-2.5-2.5c-1-1.5-1.5-3-1.5-5C8 7 9.5 4 12 2Z" />
      <circle cx="12" cy="9" r="1.6" />
      <path d="M9 15.5 6 18l1-3.5M15 15.5 18 18l-1-3.5" />
    </svg>
  );
}

function IconUserGear(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.5 2.5-6 5.5-6" />
      <circle cx="18" cy="16" r="2.2" />
      <path d="M18 12.5V13m0 6v.5m3-3.5h-.5m-6 0H14m3.7-2.5-.35.35m-2.7 2.7-.35.35m6.1 0-.35-.35m-2.7-2.7-.35-.35" />
    </svg>
  );
}

function IconLoketConfig(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 21V9l8-5 8 5v12" />
      <path d="M9 21v-6h6v6" />
      <circle cx="17" cy="7" r="2.2" />
    </svg>
  );
}

function IconMonitorPulse(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="4" width="18" height="12" rx="1.5" />
      <path d="M6 10h2l1.5-3 2 6 1.5-3H18" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

function IconChartBar(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />
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

function IconWhatsapp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z"
      />
    </svg>
  );
}

function IconHeadset(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" />
      <path d="M19 19v1a3 3 0 0 1-3 3h-3" />
    </svg>
  );
}

function IconMail(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6 8.5 6.5L20.5 6" />
    </svg>
  );
}

interface KategoriBantuan {
  icon: (props: IconProps) => ReactElement;
  judul: string;
  deskripsi: string;
}

const kategoriBantuan: KategoriBantuan[] = [
  {
    icon: IconRocket,
    judul: "Memulai (Getting Started)",
    deskripsi: "Panduan awal masuk ke Admin Portal, mengenal sidebar, dan istilah dasar antrean.",
  },
  {
    icon: IconUserGear,
    judul: "Kelola Akun",
    deskripsi: "Cara mengelola profil, mengganti kata sandi, dan menambah akun admin baru.",
  },
  {
    icon: IconLoketConfig,
    judul: "Konfigurasi Layanan",
    deskripsi: "Menambah loket baru, mengatur kategori layanan, dan urutan prefix nomor antrian.",
  },
  {
    icon: IconMonitorPulse,
    judul: "Pemantauan Antrean",
    deskripsi: "Memanggil nomor berikutnya, membuka/menutup loket, dan memantau layar Display.",
  },
  {
    icon: IconChartBar,
    judul: "Laporan & Statistik",
    deskripsi: "Cara membaca statistik antrean harian/mingguan/bulanan di halaman Laporan.",
  },
];

interface FaqItem {
  id: string;
  pertanyaan: string;
  jawaban: string;
}

const faqList: FaqItem[] = [
  {
    id: "f1",
    pertanyaan: "Bagaimana cara memanggil nomor antrian berikutnya?",
    jawaban:
      'Buka menu "Layanan Loket", pilih loket yang ingin dikelola, lalu tekan tombol "SELANJUTNYA". Nomor antrian akan bertambah otomatis dan diumumkan lewat suara.',
  },
  {
    id: "f2",
    pertanyaan: "Kenapa suara pengumuman tidak terdengar?",
    jawaban:
      "Pastikan volume perangkat tidak dalam mode senyap dan browser mengizinkan audio. Pengumuman menggunakan suara bawaan browser, jadi kualitasnya tergantung perangkat yang dipakai.",
  },
  {
    id: "f3",
    pertanyaan: "Bagaimana cara menutup atau membuka loket sementara?",
    jawaban:
      'Di halaman detail loket, tekan tombol "TUTUP LOKET" untuk menghentikan pemanggilan sementara, atau "BUKA LOKET" untuk mengaktifkannya kembali.',
  },
  {
    id: "f4",
    pertanyaan: "Bagaimana cara menambah akun admin baru?",
    jawaban:
      'Masuk ke menu "Kelola Akun" lalu pilih "Tambah Akun". Isi username dan kata sandi untuk admin baru tersebut.',
  },
  {
    id: "f5",
    pertanyaan: "Di mana saya bisa melihat statistik antrean?",
    jawaban:
      'Buka menu "Laporan" pada sidebar untuk melihat statistik antrean harian, mingguan, dan bulanan per loket.',
  },
];

export default function AdminHelpCenterPage() {
  const [query, setQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const faqTersaring = faqList.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.pertanyaan.toLowerCase().includes(q) || item.jawaban.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-12 text-center sm:px-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Pusat Bantuan Adi Oke
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
          Temukan solusi cepat, panduan langkah demi langkah, dan jawaban atas pertanyaan Anda
          mengenai Admin Portal.
        </p>

        <div className="relative mx-auto mt-6 max-w-xl">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari bantuan atau panduan..."
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 shadow-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Kategori Bantuan */}
      <h2 className="mb-4 mt-10 text-xl font-bold text-gray-900">Kategori Bantuan</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kategoriBantuan.map((item) => (
          <div
            key={item.judul}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 font-bold text-gray-900">{item.judul}</p>
            <p className="mt-1 text-sm text-gray-500">{item.deskripsi}</p>
          </div>
        ))}
      </div>

      {/* FAQ & Hubungi Kami */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Pertanyaan Umum (FAQ)</h2>

          {faqTersaring.length === 0 ? (
            <p className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-400">
              Tidak ada hasil untuk &quot;{query}&quot;.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {faqTersaring.map((item) => {
                const terbuka = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(terbuka ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-gray-800">
                        {item.pertanyaan}
                      </span>
                      <IconChevronDown
                        className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                          terbuka ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {terbuka && (
                      <p className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                        {item.jawaban}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div id="kontak-kami">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Hubungi Kami</h2>
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Masih butuh bantuan? Tim kami siap membantu kendala teknis Admin Portal.
            </p>

            <a
              href="https://wa.me/6281239646234"
              className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
                <IconWhatsapp className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">WhatsApp</p>
                <p className="text-gray-500">081239646234</p>
              </div>
            </a>

            <a
              href="mailto:admin@kutaselatan.badungkab.go.id"
              className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 transition hover:bg-gray-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                <IconMail className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-gray-800">Email</p>
                <p className="break-all text-gray-500">admin@kutaselatan.badungkab.go.id</p>
              </div>
            </a>

            <a
              href="https://wa.me/6281239646234"
              className="mt-1 flex items-center justify-center gap-2 rounded-full bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              <IconHeadset className="h-4 w-4" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}