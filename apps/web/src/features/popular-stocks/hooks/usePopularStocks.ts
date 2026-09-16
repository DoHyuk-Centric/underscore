import { useQuery } from "@tanstack/react-query";
import { getPopularStocks } from "../api/popular-stock-api";
import { getNextKstRefreshTimestamp } from "../../../lib/kst-refresh";

export function usePopularStocks() {
  const {
    data: stocks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["popular-stocks"],
    queryFn: ({ signal }) => getPopularStocks(signal),
    staleTime: (query) => {
      const fetchedAt = query.state.dataUpdatedAt;
      if (!fetchedAt) return 0;
      return getNextKstRefreshTimestamp(fetchedAt) - fetchedAt;
    },
  });

  return { stocks, isLoading, error, refetch };
}
