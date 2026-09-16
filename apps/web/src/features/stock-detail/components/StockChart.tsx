import { useId, useState } from "react";
import type { ChartPeriod, StockChartPoint } from "../mock/stock-detail-mock";

const PERIOD_OPTIONS: { value: ChartPeriod; label: string }[] = [
  { value: "1D", label: "1일" },
  { value: "1W", label: "1주" },
  { value: "1M", label: "1개월" },
  { value: "3M", label: "3개월" },
  { value: "1Y", label: "1년" },
];
const WIDTH = 640;
const HEIGHT = 240;
const PADDING = 16;
type Props = { charts: Record<ChartPeriod, StockChartPoint[]>; dayChangeRate: number };

export function StockChart({ charts, dayChangeRate }: Props) {
  const [period, setPeriod] = useState<ChartPeriod>("1D");
  const gradientId = useId();
  const points = charts[period].filter((point) => Number.isFinite(point.price));
  const prices = points.map((point) => point.price);
  const min = points.length ? Math.min(...prices) : 0;
  const max = points.length ? Math.max(...prices) : 0;
  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === period)!.label;
  const movement = period === "1D" ? dayChangeRate : (prices.at(-1) ?? 0) - (prices[0] ?? 0);
  const color = movement > 0 ? "#f04452" : movement < 0 ? "#3182f6" : "#8b95a1";
  const dots = points.map((point, index) => ({
    x: points.length === 1 ? WIDTH / 2 : PADDING + (index / (points.length - 1)) * (WIDTH - PADDING * 2),
    y: max === min ? HEIGHT / 2 : PADDING + ((max - point.price) / (max - min)) * (HEIGHT - PADDING * 2),
  }));
  const line = dots.map(({ x, y }, index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const lastDot = dots.at(-1);
  const area = lastDot ? `${line} L ${lastDot.x} ${HEIGHT} L ${dots[0].x} ${HEIGHT} Z` : "";

  return (
    <div className="stock-chart">
      <div className="stock-chart__heading"><h2>주가 흐름</h2><span>{periodLabel} 기준</span></div>
      <div className="stock-chart__extremes" aria-live="polite">
        <span>최고 <strong>{points.length ? `${max.toLocaleString("ko-KR")}원` : "—"}</strong></span>
        <span>최저 <strong>{points.length ? `${min.toLocaleString("ko-KR")}원` : "—"}</strong></span>
      </div>
      {lastDot ? (
        <>
          <svg className="stock-chart__plot" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none"
            role="img" aria-label={`${periodLabel} 주가 차트. 최저 ${min.toLocaleString("ko-KR")}원, 최고 ${max.toLocaleString("ko-KR")}원`}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.13" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[PADDING, HEIGHT / 2, HEIGHT - PADDING].map((y) => (
              <line key={y} x1={PADDING} y1={y} x2={WIDTH - PADDING} y2={y} stroke="#edf0f3" strokeDasharray="4 5" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <circle cx={lastDot.x} cy={lastDot.y} r={3} fill={color} stroke="white" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="stock-chart__axis" aria-hidden="true">
            <span>{points[0].label}</span>
            {points.length > 2 && <span>{points[Math.floor((points.length - 1) / 2)].label}</span>}
            {points.length > 1 && <span>{points.at(-1)?.label}</span>}
          </div>
        </>
      ) : <div className="stock-chart__empty" role="status">표시할 차트 데이터가 없어요.</div>}
      <div className="stock-chart__periods" role="group" aria-label="차트 조회 기간">
        {PERIOD_OPTIONS.map((option) => (
          <button key={option.value} type="button" aria-pressed={period === option.value} onClick={() => setPeriod(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
