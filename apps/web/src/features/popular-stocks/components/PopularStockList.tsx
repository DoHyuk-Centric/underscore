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

  const renderList = (listItems: typeof items, connectsToNext = false) => (
    <ol className="m-0 p-0 list-none">
      {listItems.map((item, index) => {
        const color = item.changeRate >= 0 ? 'text-[#f04452]' : 'text-[#3182f6]'
        return <ListRow key={item.stockCode} left={<span className="inline-block w-5 text-[#6b7684] text-[15px] font-bold text-center">{item.rank}</span>} contents={<span className="grid gap-1"><strong className="text-[#191f28] text-[15px]">{item.name}</strong><small className="text-[#8b95a1] text-xs">{item.detail}</small></span>} right={<span className="grid gap-1 text-right"><strong className="text-[15px] text-[#191f28]">{item.value}</strong><small className={`text-xs ${color}`}>{item.changeText}</small></span>} border={index === listItems.length - 1 && !connectsToNext ? 'none' : 'indented'} horizontalPadding="small" verticalPadding="medium" withTouchEffect />
      })}
    </ol>
  )

  return <><>{renderList(items.slice(0, INITIAL_ITEM_COUNT), expanded)}</><div className={`popular-stocks__extra ${expanded ? 'popular-stocks__extra--open' : ''}`} aria-hidden={!expanded}>{renderList(items.slice(INITIAL_ITEM_COUNT))}</div></>
}
