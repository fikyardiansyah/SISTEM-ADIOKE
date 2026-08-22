import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, type MonthlyTrendPoint } from "../../data/dashboardStats";

interface DashboardTrendChartProps {
  data: MonthlyTrendPoint[];
}

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      <ul className="flex flex-col gap-1">
        {payload.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-6 text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold text-gray-900">{item.value.toLocaleString("id-ID")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function DashboardTrendChart({ data }: DashboardTrendChartProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Keseluruhan Statistik Antrean</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tren harian sejak antrean pertama diambil — total, dilayani, dan menunggu
        </p>
      </div>

      {data.length === 0 ? (
        <p className="flex h-64 items-center justify-center text-sm text-gray-400 sm:h-72">
          Belum ada data antrean. Grafik akan muncul setelah tiket pertama diambil.
        </p>
      ) : (
      <div className="h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.total} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS.total} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDilayani" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.dilayani} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS.dilayani} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradMenunggu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.menunggu} stopOpacity={0.15} />
                <stop offset="95%" stopColor={CHART_COLORS.menunggu} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="bulan"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, "auto"]}
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TrendTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Antrean"
              stroke={CHART_COLORS.total}
              fill="url(#gradTotal)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_COLORS.total }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="dilayani"
              name="Sudah Dilayani"
              stroke={CHART_COLORS.dilayani}
              fill="url(#gradDilayani)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_COLORS.dilayani }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="menunggu"
              name="Masih Menunggu"
              stroke={CHART_COLORS.menunggu}
              fill="url(#gradMenunggu)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: CHART_COLORS.menunggu }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
