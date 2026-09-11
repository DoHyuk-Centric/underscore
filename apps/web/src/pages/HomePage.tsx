import { useState } from 'react'
import { StockSearchBar } from '../features/stock-search/components/StockSearchBar'
import { StockSearchResults } from '../features/stock-search/components/StockSearchResults'
import { useStockSearch } from '../features/stock-search/hooks/useStockSearch'
import { PopularStocks } from '../features/popular-stocks/components/PopularStocks'
import { KakaoContact } from '../features/contact/components/KakaoContact'

function HomePage() {
  const [query, setQuery] = useState('')
  const searchState = useStockSearch(query)
  const isSearching = Boolean(query.trim())

  return (
    <main className="flex min-h-full flex-col px-2 pb-6 bg-[#f7f8fa]">
      <section className="mt-3 flex grow shrink-0 flex-col rounded-[20px] bg-white px-3 py-1">
        <StockSearchBar
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onDeleteClick={() => setQuery('')}
        />
        {isSearching ? (
          <StockSearchResults query={query} {...searchState} />
        ) : (
          <PopularStocks />
        )}
      </section>
      {!isSearching && (
        <div className="flex w-full shrink-0 justify-end">
          <KakaoContact />
        </div>
      )}
    </main>
  )
}

export default HomePage
