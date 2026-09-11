import { useEffect, useState } from "react";
import type { KRXStock } from "@underscore/shared";
import { searchStocks } from "../api/stock-api";

type StockSearchState = {
  stocks: KRXStock[];
  error: string | null;
  resolvedQuery: string;
};

type StockSearchResult = {
  stocks: KRXStock[];
  isLoading: boolean;
  error: string | null;
};

const DEBOUNCE_MS = 300;
export const MIN_QUERY_LENGTH = 2;

export function useStockSearch(query: string): StockSearchResult {
  const [state, setState] = useState<StockSearchState>({
    stocks: [],
    error: null,
    resolvedQuery: "",
  });

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const debounceTimer = window.setTimeout(async () => {
      try {
        const stocks = await searchStocks(normalizedQuery, controller.signal);
        setState({ stocks, error: null, resolvedQuery: normalizedQuery });
      } catch (error) {
        if (controller.signal.aborted) return;

        setState({
          stocks: [],
          resolvedQuery: normalizedQuery,
          error:
            error instanceof Error
              ? error.message
              : "알 수 없는 오류가 발생했습니다.",
        });
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(debounceTimer);
    };
  }, [query]);

  const normalizedQuery = query.trim();

  if (normalizedQuery.length < MIN_QUERY_LENGTH) {
    return { stocks: [], isLoading: false, error: null };
  }

  if (normalizedQuery !== state.resolvedQuery) {
    return { stocks: [], isLoading: true, error: null };
  }

  return { stocks: state.stocks, isLoading: false, error: state.error };
}
