import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

const QUERY_KEY_BY_TYPE: Record<string, string[]> = {
  stocks: ['popular-stocks'],
  sectors: ['popular-sectors'],
}

export function useDailyPopularDataSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const source = new EventSource('/market-data/events')

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { type?: string }
      const queryKey = payload.type ? QUERY_KEY_BY_TYPE[payload.type] : undefined
      if (queryKey) queryClient.invalidateQueries({ queryKey })
    }

    return () => source.close()
  }, [queryClient])
}
