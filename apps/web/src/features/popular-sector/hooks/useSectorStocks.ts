import { useQuery } from "@tanstack/react-query";
import { getSectorStocks } from "../api/sector-stock-api";
import { getNextKstRefreshTimestamp } from "../../../lib/kst-refresh";

export function useSectorStocks(sectorName: string) {
  const {
    data: stocks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sector-stocks", sectorName],
    queryFn: ({ signal }) => getSectorStocks(sectorName, signal),
    enabled: Boolean(sectorName),
    staleTime: (query) => {
      const fetchedAt = query.state.dataUpdatedAt;
      if (!fetchedAt) return 0;
      return getNextKstRefreshTimestamp(fetchedAt) - fetchedAt;
    },
  });

  return { stocks, isLoading, error, refetch };
}
