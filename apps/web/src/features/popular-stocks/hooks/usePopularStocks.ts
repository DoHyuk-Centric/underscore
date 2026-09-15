import { getPopularStocks } from '../api/popular-stock-api'
import { useAsyncList } from '../../../hooks/useAsyncList'

export function usePopularStocks() {
  const { data: stocks, isLoading, error, retry } = useAsyncList(getPopularStocks)
  return { stocks, isLoading, error, retry }
}
