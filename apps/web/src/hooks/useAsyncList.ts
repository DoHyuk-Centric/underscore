import { useCallback, useEffect, useState } from 'react'

export function useAsyncList<T>(fetcher: (signal: AbortSignal) => Promise<T[]>) {
  const [data, setData] = useState<T[]>([])
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

    fetcher(controller.signal)
      .then(setData)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [retryCount, fetcher])

  return { data, isLoading, error, retry }
}
