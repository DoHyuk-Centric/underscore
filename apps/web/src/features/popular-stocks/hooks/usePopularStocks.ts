import { useEffect, useState } from 'react'
import { getPopularStocks } from '../api/popular-api'
import type { PopularStock } from '@underscore/shared'

export function usePopularStocks() {
  const [stocks, setStocks] = useState<PopularStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

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
  }, [])

  return { stocks, isLoading, error }
}
