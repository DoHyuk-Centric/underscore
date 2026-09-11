import { useCallback, useEffect, useState } from 'react'
import { getPopularStocks } from '../api/popular-api'
import type { PopularStock } from '@underscore/shared'

export function usePopularStocks() {
  const [stocks, setStocks] = useState<PopularStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retry = useCallback(() => {
    setError(null)
    setIsLoading(true)
    setRetryCount((count) => count + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getPopularStocks(controller.signal)
      .then(setStocks)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [retryCount])

  return { stocks, isLoading, error, retry }
}
