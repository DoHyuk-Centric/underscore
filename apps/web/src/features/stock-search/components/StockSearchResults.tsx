import type { KRXStock } from '@underscore/shared'

type StockSearchResultsProps = {
  query: string
  stocks: KRXStock[]
  isLoading: boolean
  error: string | null
}

export function StockSearchResults({
  query,
  stocks,
  isLoading,
  error,
}: StockSearchResultsProps) {
  if (!query.trim()) {
    return <p className="mx-2 mt-3 text-[#6b7684] text-sm">종목명이나 종목코드를 검색해보세요.</p>
  }

  if (isLoading) {
    return <p className="mx-2 mt-3 text-[#6b7684] text-sm">종목을 검색하고 있습니다...</p>
  }

  if (error) {
    return <p className="mx-2 mt-3 text-[#f04452] text-sm">{error}</p>
  }

  if (stocks.length === 0) {
    return <p className="mx-2 mt-3 text-[#6b7684] text-sm">검색 결과가 없습니다.</p>
  }

  return (
    <ul className="grid gap-2 mt-2.5 p-0 list-none">
      {stocks.map((stock) => (
        <li
          className="flex items-center justify-between py-3.5 px-4 rounded-[14px] bg-white"
          key={stock.isinCode}
        >
          <div>
            <strong className="block text-[15px]">{stock.name}</strong>
            <span className="block text-[#8b95a1] text-xs">{stock.stockCode}</span>
          </div>
          <div className="grid gap-0.75 text-right text-[#8b95a1] text-xs">
            <span>{stock.market}</span>
            <span>{stock.corpName}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
