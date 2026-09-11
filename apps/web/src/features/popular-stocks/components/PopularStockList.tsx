import { ListRow } from '@toss/tds-mobile'
import { usePopularStocks } from '../hooks/usePopularStocks'

const INITIAL_ITEM_COUNT = 5
type Props = { expanded: boolean }

export function PopularStockList({ expanded }: Props) {
  const { stocks, isLoading, error } = usePopularStocks()

  if (isLoading) return <p className="p-4 text-center text-[#8b95a1]">인기 종목을 불러오는 중...</p>
  if (error) return <p className="p-4 text-center text-[#f04452]">인기 종목을 불러오지 못했어요.</p>

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
        const isExtra = index >= INITIAL_ITEM_COUNT
        const hasDivider = index < items.length - 1

        return (
          <li
            key={item.stockCode}
            className={`${hasDivider ? 'border-b border-[#f0f1f3]' : ''} ${isExtra ? `popular-stocks__extra ${expanded ? 'popular-stocks__extra--open' : ''}` : ''}`}
            aria-hidden={isExtra ? !expanded : undefined}
          >
            <div className="min-h-0 overflow-hidden">
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
          </li>
        )
      })}
    </ol>
  )
}
