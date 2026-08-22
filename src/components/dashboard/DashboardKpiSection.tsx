import type { SVGProps } from "react";
import type { QueueStats } from "../../data/dashboardStats";
import DashboardStatCard from "./DashboardStatCard";

type IconProps = SVGProps<SVGSVGElement>;

const baseIconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconTicket(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      <path d="M9 8v8M15 8v8" />
    </svg>
  );
}

function IconCheckCircle(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
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

function IconDoorOpen(props: IconProps) {
  return (
    <svg {...baseIconProps} {...props}>
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M3 20h10V4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
      <path d="M10 12h.01" />
    </svg>
  );
}

interface DashboardKpiSectionProps {
  stats: QueueStats;
}

export default function DashboardKpiSection({ stats }: DashboardKpiSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <DashboardStatCard
        label="Total Antrean Diambil"
        value={stats.total.toLocaleString("id-ID")}
        description="Total antrean hari ini"
        accent="blue"
        icon={<IconTicket className="h-5 w-5" />}
      />
      <DashboardStatCard
        label="Sudah Dilayani"
        value={stats.served.toLocaleString("id-ID")}
        description="Antrean telah selesai dilayani"
        accent="green"
        icon={<IconCheckCircle className="h-5 w-5" />}
      />
      <DashboardStatCard
        label="Masih Menunggu"
        value={stats.waiting.toLocaleString("id-ID")}
        description="Antrean yang masih menunggu"
        accent="orange"
        icon={<IconHourglass className="h-5 w-5" />}
      />
      <DashboardStatCard
        label="Loket Aktif"
        value={`${stats.activeCounters} / ${stats.totalCounters}`}
        description="Loket sedang aktif"
        accent="indigo"
        icon={<IconDoorOpen className="h-5 w-5" />}
      />
    </div>
  );
}
