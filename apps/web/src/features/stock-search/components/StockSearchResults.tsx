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
    return <p className="stock-search__message">종목명이나 종목코드를 검색해보세요.</p>
  }

  if (isLoading) {
    return <p className="stock-search__message">종목을 검색하고 있습니다...</p>
  }

  if (error) {
    return <p className="stock-search__message stock-search__message--error">{error}</p>
  }

  if (stocks.length === 0) {
    return <p className="stock-search__message">검색 결과가 없습니다.</p>
  }

  return (
    <ul className="stock-search__results">
      {stocks.map((stock) => (
        <li className="stock-card" key={stock.isinCode}>
          <div>
            <strong className="stock-card__name">{stock.name}</strong>
            <span className="stock-card__code">{stock.stockCode}</span>
          </div>
          <div className="stock-card__meta">
            <span>{stock.market}</span>
            <span>{stock.corpName}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
