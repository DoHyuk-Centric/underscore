import { useQuery } from "@tanstack/react-query";
import { fetchMockStockDetail } from "../mock/stock-detail-mock";
import type { StockDetailSeed } from "../mock/stock-detail-mock";

export function useStockDetail(seed: StockDetailSeed) {
  const {
    data: stock,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["stock-detail", seed.stockCode],
    queryFn: () => fetchMockStockDetail(seed),
    staleTime: 60_000,
  });

  return { stock, isLoading, error, refetch };
}
