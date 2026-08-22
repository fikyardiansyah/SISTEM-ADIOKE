import type { SVGProps } from "react";
import type { PerformanceStats } from "../../data/dashboardStats";

type IconProps = SVGProps<SVGSVGElement>;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconClock(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconTimer(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M9 2h6M12 2v3" />
    </svg>
  );
}

function IconHourglass(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M6 3h12M6 21h12M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4" />
    </svg>
  );
}

interface PerformanceCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}

function PerformanceCard({ label, value, icon, accent }: PerformanceCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

interface DashboardPerformanceCardsProps {
  stats: PerformanceStats;
}

export default function DashboardPerformanceCards({ stats }: DashboardPerformanceCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <PerformanceCard
        label="Rata-rata Waktu Tunggu"
        value={`${stats.rataTungguMenit} menit`}
        icon={<IconClock className="h-5 w-5" />}
        accent="bg-orange-50 text-orange-500"
      />
      <PerformanceCard
        label="Rata-rata Waktu Pelayanan"
        value={`${stats.rataPelayananMenit} menit`}
        icon={<IconTimer className="h-5 w-5" />}
        accent="bg-green-50 text-green-600"
      />
      <PerformanceCard
        label="Antrean Terlama"
        value={`${stats.antreanTerlamaMenit} menit`}
        icon={<IconHourglass className="h-5 w-5" />}
        accent="bg-red-50 text-red-500"
      />
    </div>
  );
}
