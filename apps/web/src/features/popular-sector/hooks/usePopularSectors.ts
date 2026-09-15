import { getPopularSectors } from "../api/popular-sector-api";
import { useAsyncList } from "../../../hooks/useAsyncList";

export function usePopularSectors() {
  const { data: sectors, isLoading, error, retry } = useAsyncList(getPopularSectors);
  return { sectors, isLoading, error, retry };
}
