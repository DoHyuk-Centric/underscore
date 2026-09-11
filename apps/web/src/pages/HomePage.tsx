import { useState } from "react";
import { StockSearchBar } from "../features/stock-search/components/StockSearchBar";
import { StockSearchResults } from "../features/stock-search/components/StockSearchResults";
import { useStockSearch } from "../features/stock-search/hooks/useStockSearch";
import { PopularStocks } from "../features/popular-stocks/components/PopularStocks";

function HomePage() {
  const [query, setQuery] = useState("");
  const searchState = useStockSearch(query);

  const isSearching = Boolean(query.trim());

  return (
    <main className="flex flex-col min-h-full px-2 pb-6 bg-[#f7f8fa]">
      <section
        className={`relative z-1 flex flex-col bg-white rounded-[20px] mt-4 py-1 ${isSearching ? "flex-1 min-h-0" : ""}`}
        aria-label="종목 검색"
      >
        <StockSearchBar
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onDeleteClick={() => setQuery("")}
        />
        {isSearching ? <StockSearchResults query={query} {...searchState} /> : <PopularStocks />}
      </section>
    </main>
  );
}

export default HomePage;
