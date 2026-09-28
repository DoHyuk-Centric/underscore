import { useQuery } from "@tanstack/react-query";
import { getStockDiagnoses } from "../api/stock-diagnosis-api";
import { getNextKstRefreshTimestamp } from "../../../lib/kst-refresh";

export const useStockDiagnoses = () => {
  const {
    data: diagnoses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stock-diagnoses"],
    queryFn: ({ signal }) => getStockDiagnoses(signal),
    staleTime: (query) => {
      const fetchedAt = query.state.dataUpdatedAt;
      if (!fetchedAt) return 0;
      return getNextKstRefreshTimestamp(fetchedAt) - fetchedAt;
    },
  });
  return { diagnoses, isLoading, error };
};
