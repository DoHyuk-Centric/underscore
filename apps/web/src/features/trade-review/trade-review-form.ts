import type { TradeEntry } from '@underscore/shared'

export type TradeSide = 'buys' | 'sells'

export type TradeEntryFormValues = Omit<TradeEntry, 'price' | 'quantity'> & {
  price?: number
  quantity?: number
}

export type TradeReviewFormValues = {
  stockCode: string
  buys: TradeEntryFormValues[]
  sells: TradeEntryFormValues[]
}

export const MAX_TRADE_ENTRIES = 10

export const TRADE_SIDE_LABEL: Record<TradeSide, string> = {
  buys: '매수',
  sells: '매도',
}

export const createEmptyEntry = (): TradeEntryFormValues => ({
  date: '',
  price: undefined,
  quantity: undefined,
  reason: '',
})

// 날짜·가격·수량·근거를 하나도 적지 않은 건입니다. "분할 추가"만 누르고 비워 둔 경우가 여기에 해당합니다.
export const isEmptyEntry = (entry: TradeEntryFormValues) =>
  !entry.date && entry.price === undefined && entry.quantity === undefined && !entry.reason.trim()

export const formatNumber =(value: number) => value.toLocaleString('ko-KR')

export const describeEntries = (entries: TradeEntryFormValues[]) =>
  `${entries.length}건 · ${formatNumber(sumQuantity(entries))}주 · 평균 ${formatNumber(averagePrice(entries) ?? 0)}원`

export const sumQuantity = (entries: TradeEntryFormValues[]) =>
  entries.reduce((total, entry) => total + (entry.quantity ?? 0), 0)

export const averagePrice = (entries: TradeEntryFormValues[]) => {
  const filled = entries.filter((entry) => entry.price && entry.quantity)
  const quantity = sumQuantity(filled)
  if (quantity === 0) return null
  const amount = filled.reduce((total, entry) => total + entry.price! * entry.quantity!, 0)
  return Math.round(amount / quantity)
}
