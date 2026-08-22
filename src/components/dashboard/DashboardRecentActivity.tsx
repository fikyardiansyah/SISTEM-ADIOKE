import type { AktivitasLog } from "../../context/QueueContext";

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type AktivitasStatus = "panggil" | "selesai" | "tambah" | "loket" | "default";

function getAktivitasStatus(pesan: string): AktivitasStatus {
  const lower = pesan.toLowerCase();
  if (lower.includes("memanggil antrean")) return "panggil";
  if (lower.includes("selesai dilayani") || lower.includes("telah dilayani")) return "selesai";
  if (
    lower.includes("ditambahkan") ||
    lower.includes("baru ditambahkan") ||
    lower.includes("kategori baru")
  ) {
    return "tambah";
  }
  if (lower.includes("diaktifkan") || lower.includes("dinonaktifkan")) return "loket";
  return "default";
}

const statusStyles: Record<AktivitasStatus, { bg: string; text: string; label: string }> = {
  panggil: { bg: "bg-blue-50", text: "text-blue-600", label: "Panggilan" },
  selesai: { bg: "bg-green-50", text: "text-green-600", label: "Selesai" },
  tambah: { bg: "bg-violet-50", text: "text-violet-600", label: "Perubahan" },
  loket: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Loket" },
  default: { bg: "bg-gray-50", text: "text-gray-500", label: "Aktivitas" },
};

function AktivitasIcon({ status }: { status: AktivitasStatus }) {
  const common = { className: "h-4 w-4" } as const;

  if (status === "panggil") {
    return (
      <svg {...baseIconProps} {...common}>
        <path d="M3 11v2a2 2 0 0 0 2 2h1l4 4V5L6 9H5a2 2 0 0 0-2 2Z" />
        <path d="M16 8a5 5 0 0 1 0 8M19 5a9 9 0 0 1 0 14" />
      </svg>
    );
  }
  if (status === "selesai") {
    return (
      <svg {...baseIconProps} {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    );
  }
  if (status === "tambah") {
    return (
      <svg {...baseIconProps} {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (status === "loket") {
    return (
      <svg {...baseIconProps} {...common}>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    );
  }
  return (
    <svg {...baseIconProps} {...common}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

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

interface DashboardRecentActivityProps {
  items: AktivitasLog[];
}

export default function DashboardRecentActivity({ items }: DashboardRecentActivityProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Aktivitas Terbaru</h2>
          <p className="mt-1 text-sm text-gray-500">Log aktivitas sistem antrean terkini</p>
        </div>
        {items.length > 0 && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
            {items.length} entri
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Belum ada aktivitas tercatat.</p>
      ) : (
        <ul className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
          {items.slice(0, 6).map((item) => {
            const status = getAktivitasStatus(item.pesan);
            const styles = statusStyles[status];

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-gray-50 p-3 transition hover:bg-gray-50/80"
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles.bg} ${styles.text}`}
                >
                  <AktivitasIcon status={status} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${styles.bg} ${styles.text}`}
                    >
                      {styles.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatWaktuRelatif(item.waktu)}</span>
                  </div>
                  <p className="text-sm leading-snug text-gray-700">
                    {item.pesan}
                    {item.detail && (
                      <span className="font-semibold text-gray-900"> {item.detail}</span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
