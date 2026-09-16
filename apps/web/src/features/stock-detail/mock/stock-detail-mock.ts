import type { PopularStock } from "@underscore/shared";

export type Market = PopularStock["market"];

export type ChartPeriod = "1D" | "1W" | "1M" | "3M" | "1Y";

export type StockChartPoint = {
  label: string;
  price: number;
};

export type StockDetail = {
  stockCode: string;
  name: string;
  market: Market;
  sector: string;
  price: number;
  change: number;
  changeRate: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  tradingValue: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  sharesOutstanding: number;
  charts: Record<ChartPeriod, StockChartPoint[]>;
};

export type StockDetailSeed = {
  stockCode: string;
  name?: string;
  market?: Market;
  price?: number;
  change?: number;
  changeRate?: number;
  volume?: number;
  tradingValue?: number;
};

const PERIOD_LIST: ChartPeriod[] = ["1D", "1W", "1M", "3M", "1Y"];

// 인기 섹터 화면과 동일한 KRX 테마 지수 17종 (접두어 "KRX " 제외)
const SECTOR_NAMES = [
  "자동차",
  "반도체",
  "헬스케어",
  "은행",
  "에너지화학",
  "철강",
  "방송통신",
  "건설",
  "증권",
  "기계장비",
  "보험",
  "운송",
  "경기소비재",
  "필수소비재",
  "K콘텐츠",
  "정보기술",
  "유틸리티",
];

// 자주 조회될 만한 대형주는 실제 업종에 가깝게 고정
const KNOWN_SECTOR_BY_CODE: Record<string, string> = {
  "005930": "반도체", // 삼성전자
  "000660": "반도체", // SK하이닉스
  "005380": "자동차", // 현대차
  "000270": "자동차", // 기아
  "012330": "자동차", // 현대모비스
  "035420": "정보기술", // NAVER
  "035720": "정보기술", // 카카오
  "051910": "에너지화학", // LG화학
  "006400": "에너지화학", // 삼성SDI
  "373220": "에너지화학", // LG에너지솔루션
  "105560": "은행", // KB금융
  "055550": "은행", // 신한지주
  "086790": "은행", // 하나금융지주
  "207940": "헬스케어", // 삼성바이오로직스
  "068270": "헬스케어", // 셀트리온
  "005490": "철강", // POSCO홀딩스
  "015760": "유틸리티", // 한국전력
  "030200": "방송통신", // KT
  "000810": "보험", // 삼성화재
  "006800": "증권", // 미래에셋증권
};

function pickSector(random: () => number, stockCode: string): string {
  return (
    KNOWN_SECTOR_BY_CODE[stockCode] ??
    SECTOR_NAMES[Math.floor(random() * SECTOR_NAMES.length)]
  );
}

function hashSeed(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function randomBetween(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatMonthDay(date: Date): string {
  return `${pad2(date.getMonth() + 1)}/${pad2(date.getDate())}`;
}

function formatYearMonth(date: Date): string {
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}`;
}

const WEEKDAY_LABEL = ["일", "월", "화", "수", "목", "금", "토"];

function buildLabels(period: ChartPeriod, pointCount: number): string[] {
  const now = new Date();

  if (period === "1D") {
    const labels: string[] = [];
    for (let i = 0; i < pointCount; i += 1) {
      const totalMinutes = 9 * 60 + i * 15;
      labels.push(`${pad2(Math.floor(totalMinutes / 60))}:${pad2(totalMinutes % 60)}`);
    }
    return labels;
  }

  if (period === "1W") {
    return Array.from({ length: pointCount }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (pointCount - 1 - i));
      return WEEKDAY_LABEL[date.getDay()];
    });
  }

  if (period === "1M") {
    return Array.from({ length: pointCount }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (pointCount - 1 - i));
      return formatMonthDay(date);
    });
  }

  if (period === "3M") {
    return Array.from({ length: pointCount }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (pointCount - 1 - i) * 7);
      return formatMonthDay(date);
    });
  }

  return Array.from({ length: pointCount }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (pointCount - 1 - i));
    return formatYearMonth(date);
  });
}

const PERIOD_POINT_COUNT: Record<ChartPeriod, number> = {
  "1D": 27,
  "1W": 7,
  "1M": 30,
  "3M": 13,
  "1Y": 12,
};

const PERIOD_VOLATILITY: Record<ChartPeriod, number> = {
  "1D": 0.006,
  "1W": 0.015,
  "1M": 0.03,
  "3M": 0.05,
  "1Y": 0.09,
};

function generateWalk(
  random: () => number,
  length: number,
  endValue: number,
  volatilityRatio: number,
): number[] {
  const volatility = endValue * volatilityRatio;
  const values: number[] = [];
  let value = endValue;

  for (let i = 0; i < length; i += 1) {
    values.push(value);
    const drift = (random() - 0.5) * volatility;
    value = Math.max(value - drift, endValue * 0.4);
  }

  return values.reverse().map((price) => Math.round(price));
}

function buildCharts(random: () => number, price: number): Record<ChartPeriod, StockChartPoint[]> {
  const charts = {} as Record<ChartPeriod, StockChartPoint[]>;

  for (const period of PERIOD_LIST) {
    const pointCount = PERIOD_POINT_COUNT[period];
    const prices = generateWalk(random, pointCount, price, PERIOD_VOLATILITY[period]);
    const labels = buildLabels(period, pointCount);

    charts[period] = prices.map((chartPrice, index) => ({
      label: labels[index],
      price: chartPrice,
    }));
  }

  return charts;
}

export function generateStockDetail(seed: StockDetailSeed): StockDetail {
  const random = createRandom(hashSeed(seed.stockCode));

  const price = seed.price ?? Math.round(randomBetween(random, 8_000, 300_000) / 10) * 10;
  const changeRate = seed.changeRate ?? randomBetween(random, -4, 4);
  const change = seed.change ?? Math.round(price * (changeRate / 100));
  const prevClose = price - change;

  const charts = buildCharts(random, price);
  const dayChart = charts["1D"];
  const dayPrices = dayChart.map((point) => point.price);

  const sharesOutstanding = Math.round(randomBetween(random, 3_000_000, 300_000_000));
  const marketCap = price * sharesOutstanding;

  const high52w = Math.round(Math.max(price, price * randomBetween(random, 1.05, 1.6)));
  const low52w = Math.round(Math.min(price, price * randomBetween(random, 0.45, 0.95)));

  return {
    stockCode: seed.stockCode,
    name: seed.name ?? `종목 ${seed.stockCode}`,
    market: seed.market ?? "KOSPI",
    sector: pickSector(random, seed.stockCode),
    price,
    change,
    changeRate,
    open: dayPrices[0],
    high: Math.max(...dayPrices),
    low: Math.min(...dayPrices),
    prevClose,
    volume: seed.volume ?? Math.round(randomBetween(random, 50_000, 8_000_000)),
    tradingValue: seed.tradingValue ?? Math.round(price * randomBetween(random, 50_000, 8_000_000)),
    marketCap,
    high52w,
    low52w,
    sharesOutstanding,
    charts,
  };
}

export async function fetchMockStockDetail(seed: StockDetailSeed): Promise<StockDetail> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return generateStockDetail(seed);
}
