import { useQuery } from "@tanstack/react-query";
import { getPopularStocks } from "../api/popular-stock-api";

export function usePopularStocks() {
  const {
    data: stocks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["popular-stocks"],
    queryFn: ({ signal }) => getPopularStocks(signal),
    staleTime: 60 * 1000,
  });

  return { stocks, isLoading, error, refetch };
}
