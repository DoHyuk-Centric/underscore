import { useEffect, useState } from 'react'
import { Skeleton } from '@toss/tds-mobile'
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
  onSelect?: (stock: KRXStock) => void
}

export const StockSearchResults = ({
  query,
  stocks,
  isLoading,
  error,
  onSelect,
}: StockSearchResultsProps) => {
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
      <ul className="m-0! mt-2.5! grid min-h-0 flex-1 content-start gap-2 overflow-y-auto p-0 list-none">
        {stocks.map((stock) => {
          const itemContent = (
            <>
              <div>
                <strong className="block text-[15px]">{stock.name}</strong>
                <span className="block text-[#8b95a1] text-xs">{stock.stockCode}</span>
              </div>
              <div className="grid gap-0.75 text-right text-[#8b95a1] text-xs">
                <span>{stock.market}</span>
              </div>
            </>
          )

          return (
            <li key={stock.isinCode}>
              {onSelect ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-3.5 px-4 rounded-[14px] bg-white border-0 text-left text-inherit cursor-pointer transition-colors active:bg-[#f2f4f6]"
                  onClick={() => onSelect(stock)}
                >
                  {itemContent}
                </button>
              ) : (
                <div className="flex items-center justify-between py-3.5 px-4 rounded-[14px] bg-white">
                  {itemContent}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  })()

  return <div className="flex-1 min-h-0 flex flex-col">{content}</div>
}

