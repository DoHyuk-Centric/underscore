import { useEffect, useState } from 'react'
import { Skeleton } from '@toss/tds-mobile'
import { useNavigate } from 'react-router-dom'
import type { KRXStock } from '@underscore/shared'
import { NoSearchResults } from './NoSearchResults'
import { SearchErrorState } from './SearchErrorState'
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
  const navigate = useNavigate()
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
        <div className="mt-2.5 min-w-0 flex-1 overflow-hidden">
          <Skeleton pattern="subtitleList" repeatLastItemCount={3} style={{ width: '100%' }} />
        </div>
      ) : null
    }

    if (error) {
      return <SearchErrorState />
    }

    if (stocks.length === 0) {
      return <NoSearchResults query={query} />
    }

    return (
      <ul className="grid min-h-0 flex-1 gap-2 mt-2.5 overflow-y-auto p-0 list-none">
        {stocks.map((stock) => (
          <li
            className="flex items-center justify-between py-3.5 px-4 rounded-[14px] bg-white active:bg-[#f2f4f6] cursor-pointer"
            key={stock.isinCode}
            role="button"
            tabIndex={0}
            onClick={() =>
              navigate(`/stocks/${stock.stockCode}`, {
                state: { name: stock.name, market: stock.market },
              })
            }
            onKeyDown={(event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              navigate(`/stocks/${stock.stockCode}`, {
                state: { name: stock.name, market: stock.market },
              })
            }}
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
