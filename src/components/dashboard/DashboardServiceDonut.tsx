import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DONUT_COLORS, type ServiceDistributionItem } from "../../data/dashboardStats";

interface DashboardServiceDonutProps {
  data: ServiceDistributionItem[];
}

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ServiceDistributionItem & { persen: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{item.nama}</p>
      <p className="mt-1 text-sm text-gray-600">
        {item.jumlah.toLocaleString("id-ID")} antrean · {item.persen}%
      </p>
    </div>
  );
}

export default function DashboardServiceDonut({ data }: DashboardServiceDonutProps) {
  const total = data.reduce((sum, item) => sum + item.jumlah, 0);
  const chartData = data.map((item) => ({
    ...item,
    persen: total > 0 ? Math.round((item.jumlah / total) * 100) : 0,
  }));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Distribusi Antrean Berdasarkan Layanan</h2>
        <p className="mt-1 text-sm text-gray-500">Proporsi antrean per kategori layanan</p>
      </div>

      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="jumlah"
              nameKey="nama"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<DonutTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-gray-900">{total.toLocaleString("id-ID")}</p>
          <p className="text-xs text-gray-400">Total antrean</p>
        </div>
      </div>

      <ul className="mt-4 flex max-h-40 flex-col gap-2 overflow-y-auto">
        {chartData.map((item, index) => (
          <li key={item.nama} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-gray-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span className="truncate">{item.nama}</span>
            </span>
            <span className="shrink-0 font-semibold text-gray-900">
              {item.jumlah} <span className="font-normal text-gray-400">({item.persen}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
