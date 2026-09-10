import { useState } from 'react'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import { StockSearchBar } from './features/stock-search/components/StockSearchBar'
import { StockSearchResults } from './features/stock-search/components/StockSearchResults'
import { useStockSearch } from './features/stock-search/hooks/useStockSearch'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const { stocks, isLoading, error } = useStockSearch(query)

  return (
    <TDSMobileAITProvider>
      <main className="stock-search">
        <header className="stock-search__header">
          <p className="stock-search__eyebrow">MARKET DATA</p>
          <h1>종목 검색</h1>
          <p>관심 있는 종목을 검색하고 기본 정보를 확인해보세요.</p>
        </header>

        <div className="stock-search__bar">
          <StockSearchBar
            aria-label="종목 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <StockSearchResults
          query={query}
          stocks={stocks}
          isLoading={isLoading}
          error={error}
        />
      </main>
    </TDSMobileAITProvider>
  )
}

export default App
