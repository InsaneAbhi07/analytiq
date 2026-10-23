import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Legends are rendered in HTML next to each chart, so Chart.js's own legend plugin isn't registered.
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip);
ChartJS.defaults.font.family = "Inter, system-ui, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = "#717189";

// Categorical slots in fixed order (CVD-validated reference order).
export const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
export const ORDINAL = ["#bdaeff", "#9c82fd", "#7c55f8", "#6a36ee", "#5a26d6", "#4b21b0"];

const tooltip = { backgroundColor: "#151526", padding: 10, cornerRadius: 8, titleFont: { weight: 600 as const }, boxPadding: 4 };

export function BarChart({ labels, series, horizontal, stacked, height = 260 }: {
  labels: string[];
  series: { label: string; data: number[]; color?: string }[];
  horizontal?: boolean;
  stacked?: boolean;
  height?: number;
}) {
  const valueAxis = { beginAtZero: true, stacked, border: { display: false }, grid: { color: "#efeff6" }, ticks: { precision: 0, maxTicksLimit: 5 } };
  const catAxis = { stacked, grid: { display: false }, border: { color: "#e2e2ec" } };
  return (
    <div style={{ height }}>
      <Bar
        data={{
          labels,
          datasets: series.map((s, i) => ({
            label: s.label, data: s.data, backgroundColor: s.color ?? SERIES[i], borderRadius: 4, borderSkipped: "start" as const, maxBarThickness: 30,
            borderColor: "#fff", borderWidth: stacked ? { top: 2 } : 0,
          })),
        }}
        options={{
          maintainAspectRatio: false,
          indexAxis: horizontal ? "y" : "x",
          interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: false }, tooltip },
          scales: horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis },
        }}
      />
    </div>
  );
}

export function DonutChart({ labels, data, height = 180 }: { labels: string[]; data: number[]; height?: number }) {
  return (
    <div style={{ height, width: height }}>
      <Doughnut
        data={{ labels, datasets: [{ data, backgroundColor: SERIES.slice(0, data.length), borderColor: "#fff", borderWidth: 2 }] }}
        options={{ maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false }, tooltip } }}
      />
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} />{i.label}</span>
      ))}
    </div>
  );
}
