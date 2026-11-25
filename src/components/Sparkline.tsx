import type { PricePoint } from "@/lib/types";

export function Sparkline({
  points,
  stroke = "var(--gold)",
}: {
  points: PricePoint[];
  stroke?: string;
}) {
  if (points.length < 2) {
    return <div className="sparkline empty">No history yet</div>;
  }

  const values = points.map((p) => p.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 320;
  const h = 72;
  const path = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 8) - 4;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="Price history"
    >
      <path d={path} fill="none" stroke={stroke} strokeWidth="2.2" />
    </svg>
  );
}
