import { useEffect, useState } from 'react'
import { Skeleton } from '@toss/tds-mobile'
import type { KRXStock } from '@underscore/shared'
import { NoSearchResults } from './NoSearchResults'
import { SearchHint } from './SearchHint'
import { MIN_QUERY_LENGTH } from '../hooks/useStockSearch'

const SKELETON_DELAY_MS = 300

type StockSearchResultsProps = {
  query: string
  stocks: KRXStock[]
  isLoading: boolean
  error: string | null
}

export function StockSearchResults({
  query,
  stocks,
  isLoading,
  error,
}: StockSearchResultsProps) {
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShowSkeleton(false)
      return
    }

    const timer = window.setTimeout(() => setShowSkeleton(true), SKELETON_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [isLoading])

  const content = (() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      return <SearchHint />
    }

    if (isLoading) {
      return showSkeleton ? (
        <Skeleton pattern="subtitleList" repeatLastItemCount={3} className="mt-2.5" />
      ) : null
    }

    if (error) {
      return (
        <p className="flex-1 flex items-center justify-center text-center text-[#f04452] text-sm -translate-y-8">
          {error}
        </p>
      )
    }

    if (stocks.length === 0) {
      return <NoSearchResults query={query} />
    }

    return (
      <ul className="grid gap-2 mt-2.5 p-0 list-none">
        {stocks.map((stock) => (
          <li
            className="flex items-center justify-between py-3.5 px-4 rounded-[14px] bg-white"
            key={stock.isinCode}
          >
            <div>
              <strong className="block text-[15px]">{stock.name}</strong>
              <span className="block text-[#8b95a1] text-xs">{stock.stockCode}</span>
            </div>
            <div className="grid gap-0.75 text-right text-[#8b95a1] text-xs">
              <span>{stock.market}</span>
            </div>
          </li>
        ))}
      </ul>
    )
  })()

  return <div className="flex-1 min-h-0 flex flex-col">{content}</div>
}
