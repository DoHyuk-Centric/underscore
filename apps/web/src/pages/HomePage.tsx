import { useState } from 'react'
import { StockSearchBar } from '../features/stock-search/components/StockSearchBar'
import { StockSearchResults } from '../features/stock-search/components/StockSearchResults'
import { useStockSearch } from '../features/stock-search/hooks/useStockSearch'
import { PopularStocks } from '../features/popular-stocks/components/PopularStocks'
import { KakaoContact } from '../features/contact/components/KakaoContact'

const HomePage = () => {
  const [query, setQuery] = useState('')
  const searchState = useStockSearch(query)
  const isSearching = Boolean(query.trim())

  return (
    <main
      className={`flex flex-col bg-[#f7f8fa] ${
        isSearching ? 'h-full min-h-0 pb-4' : 'min-h-full pb-7'
      }`}
    >
      <section
        aria-label="종목 검색"
        className={`shrink-0 bg-white px-5 ${isSearching ? 'py-3' : 'pt-5 pb-2'}`}
      >
        {!isSearching && (
          <div className="px-3">
            <p className="m-0 mb-2.5 text-xs leading-4.5 font-semibold tracking-[-0.2px] text-[#63758b]">
              나만의 투자 기준을 검증
            </p>
            <h1 className="m-0 text-[clamp(24px,6.5vw,28px)] leading-[1.4] font-bold tracking-[-1px] break-keep text-[#191f28]">
              오늘은 어떤 종목에<br />
              <span className="relative inline-block">
                밑줄
                <svg
                  className="pointer-events-none absolute -bottom-2 left-[3%] h-3.5 w-[106%] text-[#3182f6]"
                  viewBox="0 0 120 14"
                  fill="none"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 8.5C32 1.5 77 1 117 7.5C80 4.5 39 5.5 5 13Q.5 13 1 10.5Q1.5 9 4 8.5Z"
                    fill="currentColor"
                  />
                </svg>
              </span>을 그어볼까요?
            </h1>
            <p className="m-0 mt-2 text-[13px] leading-5.25 tracking-[-0.35px] break-keep text-[#8b95a1]">
              궁금한 종목을 찾고, 내 판단을 쌓아가세요.
            </p>
          </div>
        )}
        <div className="-mb-2">
          <StockSearchBar
            value={query}
            aria-label="종목명 또는 종목코드 검색"
            placeholder="종목명 또는 종목코드 검색"
            onChange={(event) => setQuery(event.target.value)}
            onDeleteClick={() => setQuery('')}
          />
        </div>
      </section>
      {isSearching ? (
        <section className="flex min-h-0 flex-1 flex-col px-5" aria-label="종목 검색 결과">
          <StockSearchResults query={query} {...searchState} />
        </section>
      ) : (
        <div className="mx-2 mt-4 rounded-[20px] bg-white px-3 pt-4 pb-1">
          <PopularStocks />
        </div>
      )}
      {!isSearching && (
        <aside
          aria-label="서비스 의견"
          className="mx-6 mt-6 flex flex-wrap items-center justify-between gap-3 [&_.kakao-contact]:m-0! [&_.kakao-contact]:shadow-none!"
        >
          <div>
            <p className="m-0 mb-1 text-xs leading-4.5 font-semibold text-[#6b7684]">함께 만드는 밑줄</p>
            <span className="text-[11px] leading-4.5 text-[#8b95a1]">여러분의 의견을 들려주세요.</span>
          </div>
          <KakaoContact />
        </aside>
      )}
    </main>
  )
}

export default HomePage

