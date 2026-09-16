import { useQuery } from "@tanstack/react-query";
import { getPopularSectors } from "../api/popular-sector-api";

export function usePopularSectors() {
  const {
    data: sectors = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["popular-sectors"],
    queryFn: ({ signal }) => getPopularSectors(signal),
    staleTime: 60 * 1000,
  });
  return { sectors, isLoading, error, refetch };
}
