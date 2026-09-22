import { useQuery } from "@tanstack/react-query";
import { getPopularSectors } from "../api/popular-sector-api";
import { getNextKstRefreshTimestamp } from "../../../lib/kst-refresh";

export const usePopularSectors = () => {
  const {
    data: stocks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["popular-sectors"],
    queryFn: ({ signal }) => getPopularSectors(signal),
    staleTime: (query) => {
      const fetchedAt = query.state.dataUpdatedAt;
      if (!fetchedAt) return 0;
      return getNextKstRefreshTimestamp(fetchedAt) - fetchedAt;
    },
  });
  return { stocks, isLoading, error, refetch };
};
