import { useEffect } from 'react'
import { ListRow, Skeleton } from '@toss/tds-mobile'
import { usePopularStocks } from '../hooks/usePopularStocks'
import { PopularStocksError } from './PopularStocksError'
import './PopularList.css'

const INITIAL_ITEM_COUNT = 5
type Props = { expanded: boolean; onErrorChange?: (hasError: boolean) => void }

export function PopularStockList({ expanded, onErrorChange }: Props) {
  const { stocks, isLoading, error, retry } = usePopularStocks()

  useEffect(() => {
    onErrorChange?.(Boolean(error))
  }, [error, onErrorChange])

  if (isLoading) {
    return <Skeleton pattern="listOnly" repeatLastItemCount={5} style={{ width: '100%' }} />
  }
  if (error) {
    return <PopularStocksError onRetry={retry} />
  }

  const items = stocks.map((stock) => ({
    ...stock,
    detail: `${stock.market} · ${stock.stockCode}`,
    value: `${stock.price.toLocaleString()}원`,
    changeText: `${stock.changeRate >= 0 ? '+' : ''}${stock.changeRate.toFixed(2)}%`,
  }))

  return (
    <ol className="m-0 list-none p-0">
      {items.map((item, index) => {
        const color = item.changeRate >= 0 ? 'text-[#f04452]' : 'text-[#3182f6]'
        const collapsed = index >= INITIAL_ITEM_COUNT && !expanded

        return (
          <li
            key={item.stockCode}
            className="popular-list__row"
            data-collapsed={collapsed}
            aria-hidden={collapsed || undefined}
          >
            <div className="popular-list__clip">
              <div className={index > 0 ? 'border-t border-[#f0f1f3]' : undefined}>
              <ListRow
                left={<span className="inline-block w-5 text-center text-[15px] font-bold text-[#6b7684]">{item.rank}</span>}
                contents={<span className="grid gap-1"><strong className="text-[15px] text-[#191f28]">{item.name}</strong><small className="text-xs text-[#8b95a1]">{item.detail}</small></span>}
                right={<span className="grid gap-1 text-right"><strong className="text-[15px] text-[#191f28]">{item.value}</strong><small className={`text-xs ${color}`}>{item.changeText}</small></span>}
                border="none"
                horizontalPadding="small"
                verticalPadding="medium"
                withTouchEffect
              />
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
