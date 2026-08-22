import type { ReactNode } from "react";

type AccentColor = "blue" | "green" | "orange" | "indigo";

const accentStyles: Record<
  AccentColor,
  { icon: string; border: string; value: string }
> = {
  blue: {
    icon: "bg-blue-50 text-blue-600",
    border: "border-blue-100",
    value: "text-blue-600",
  },
  green: {
    icon: "bg-green-50 text-green-600",
    border: "border-green-100",
    value: "text-green-600",
  },
  orange: {
    icon: "bg-orange-50 text-orange-500",
    border: "border-orange-100",
    value: "text-orange-500",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600",
    border: "border-indigo-100",
    value: "text-indigo-600",
  },
};

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  description: string;
  accent: AccentColor;
  icon: ReactNode;
}

export default function DashboardStatCard({
  label,
  value,
  description,
  accent,
  icon,
}: DashboardStatCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${styles.value}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  );
}
