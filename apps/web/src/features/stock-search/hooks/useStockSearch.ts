import { useEffect, useState } from 'react'
import type { KRXStock } from '@underscore/shared'
import { searchStocks } from '../api/stock-api'

type StockSearchState = {
  stocks: KRXStock[]
  isLoading: boolean
  error: string | null
}

const DEBOUNCE_MS = 250

export function useStockSearch(query: string): StockSearchState {
  const [state, setState] = useState<StockSearchState>({
    stocks: [],
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const stocks = await searchStocks(normalizedQuery, controller.signal)
        setState({ stocks, isLoading: false, error: null })
      } catch (error) {
        if (controller.signal.aborted) return

        setState({
          stocks: [],
          isLoading: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  if (!query.trim()) {
    return { stocks: [], isLoading: false, error: null }
  }

  return state
}
