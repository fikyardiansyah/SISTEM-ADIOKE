import { useState } from "react";
import type { RentangTanggal } from "../../data/dashboardStats";

interface DashboardDateRangeFilterProps {
  rentang: RentangTanggal;
  onChange: (rentang: RentangTanggal) => void;
}

const PRESET_OPTIONS = [
  { label: "Hari Ini", hari: 1 },
  { label: "7 Hari Terakhir", hari: 7 },
  { label: "30 Hari Terakhir", hari: 30 },
  { label: "90 Hari Terakhir", hari: 90 },
];

function formatLabelTanggal(tanggalKey: string): string {
  return new Date(`${tanggalKey}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export default function DashboardDateRangeFilter({ rentang, onChange }: DashboardDateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(false);

  const presetAktif = PRESET_OPTIONS.find((opt) => {
    const preset = rentangDariHari(opt.hari);
    return preset.mulai === rentang.mulai && preset.akhir === rentang.akhir;
  });

  const handlePilihPreset = (hari: number) => {
    setShowCustom(false);
    onChange(rentangDariHari(hari));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-1.5 pl-2 pr-1 text-sm font-medium text-gray-500">
        <IconCalendar />
        {formatLabelTanggal(rentang.mulai)} – {formatLabelTanggal(rentang.akhir)}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        {PRESET_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => handlePilihPreset(opt.hari)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              presetAktif?.label === opt.label && !showCustom
                ? "bg-blue-600 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
            showCustom || !presetAktif ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          Kustom
        </button>
      </div>

      {showCustom && (
        <div className="flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <label className="flex items-center gap-2 text-xs text-gray-500">
            Dari
            <input
              type="date"
              value={rentang.mulai}
              max={rentang.akhir}
              onChange={(e) => onChange({ ...rentang, mulai: e.target.value })}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-500">
            Sampai
            <input
              type="date"
              value={rentang.akhir}
              min={rentang.mulai}
              max={formatLabelHariIni()}
              onChange={(e) => onChange({ ...rentang, akhir: e.target.value })}
              className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      )}
    </div>
  );
}

function rentangDariHari(hari: number): RentangTanggal {
  const akhir = new Date();
  const mulai = new Date();
  mulai.setDate(mulai.getDate() - (hari - 1));
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { mulai: fmt(mulai), akhir: fmt(akhir) };
}

function formatLabelHariIni(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}