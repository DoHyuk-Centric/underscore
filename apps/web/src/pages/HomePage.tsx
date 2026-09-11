import { useState } from 'react'
import { IconButton } from '@toss/tds-mobile'
import { StockSearchBar } from '../features/stock-search/components/StockSearchBar'
import { StockSearchResults } from '../features/stock-search/components/StockSearchResults'
import { useStockSearch } from '../features/stock-search/hooks/useStockSearch'

function HomePage() {
  const [query, setQuery] = useState('')
  const searchState = useStockSearch(query)

  return (
    <main className="home-screen">
      <header className="home-header">
        <div className="home-brand">
          <img
            className="home-brand-mark"
            src="/mitjul-logo-04-black.svg"
            alt=""
            aria-hidden="true"
          />
          밑줄
        </div>
        <IconButton
          src="/icon-menu.svg"
          aria-label="메뉴 열기"
          bgColor="transparent"
          iconSize={24}
        />
      </header>

      <section className="home-search" aria-label="종목 검색">
        <StockSearchBar
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onDeleteClick={() => setQuery('')}
        />
        {query.trim() && <StockSearchResults query={query} {...searchState} />}
      </section>

      <section className="home-intro">
        <p className="home-eyebrow">AI 판단 리플레이</p>
        <h1>내 거래가<br />다음 판단의 밑줄이 되도록</h1>
        <p>수익률과 함께, 그때의 이유도 돌아봐요.</p>
      </section>

      <button type="button" className="home-primary-action">
        첫 거래 기록하기
        <span aria-hidden="true">→</span>
      </button>

      <section className="home-replays" aria-labelledby="replay-title">
        <div className="home-section-heading">
          <h2 id="replay-title">나의 판단 리플레이</h2>
          <span>0개</span>
        </div>
        <div className="home-empty-state">
          <div className="home-empty-icon" aria-hidden="true">_</div>
          <strong>첫 기록을 기다리고 있어요</strong>
          <p>거래를 남기면 AI와 함께 그때의 판단을 돌아볼 수 있어요.</p>
        </div>
      </section>
    </main>
  )
}

export default HomePage
