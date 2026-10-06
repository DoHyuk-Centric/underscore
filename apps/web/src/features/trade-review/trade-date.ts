const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
const DAY_MS = 24 * 60 * 60 * 1000

// 상장 이전이나 너무 먼 과거를 고르지 않도록 선택 가능한 가장 이른 날짜를 둡니다.
export const EARLIEST_TRADE_DATE = new Date(2000, 0, 1)

export const startOfToday = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// KRX 일별 시세는 다음 날 공개되므로 어제까지만 거래일로 고를 수 있습니다.
export const latestTradeDate = () => {
  const today = startOfToday()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
}

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`

export const fromDateKey = (key: string) =>
  /^\d{8}$/.test(key)
    ? new Date(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)))
    : null

export const formatTradeDate = (date: Date) =>
  `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()} (${WEEKDAY_LABELS[date.getDay()]})`

export const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export const countHoldingDays = (buyDate: Date, sellDate: Date) =>
  Math.round((sellDate.getTime() - buyDate.getTime()) / DAY_MS)
