import { useState } from "react";
import { IconButton } from "@toss/tds-mobile";
import { StockSearchBar } from "../features/stock-search/components/StockSearchBar";
import { StockSearchResults } from "../features/stock-search/components/StockSearchResults";
import { useStockSearch } from "../features/stock-search/hooks/useStockSearch";
import { PopularStocks } from "../features/popular-stocks/components/PopularStocks";

function HomePage() {
  const [query, setQuery] = useState("");
  const searchState = useStockSearch(query);

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
          onDeleteClick={() => setQuery("")}
        />
        {query.trim() && <StockSearchResults query={query} {...searchState} />}
      </section>

      {!query.trim() && <PopularStocks />}
    </main>
  );
}

export default HomePage;
