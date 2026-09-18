import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PopularList } from '../components/PopularList'
import { PopularListSkeleton } from '../components/PopularListSkeleton'
import { PopularListError } from '../components/PopularListError'
import { useSectorStocks } from '../features/popular-sector/hooks/useSectorStocks'
import { getChangeRatePresentation } from '../lib/change-rate-presentation'

function formatMarketCap(value: number): string {
  const 조 = 1_000_000_000_000
  const 억 = 100_000_000

  if (value >= 조) return `${(value / 조).toFixed(1)}조원`
  return `${Math.round(value / 억).toLocaleString()}억원`
}

function SectorStocksPage() {
  const { name = '' } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const { stocks, isLoading, error, refetch } = useSectorStocks(name)

  const items = stocks.map((stock) => {
    const change = getChangeRatePresentation(stock.changeRate)

    return {
      key: stock.stockCode,
      rank: stock.rank,
      name: stock.name,
      detail: `${stock.market} · 시총 ${formatMarketCap(stock.marketCap)}`,
      right: (
        <span className="grid gap-1 text-right">
          <strong className="text-[15px] text-[#191f28]">{stock.price.toLocaleString()}원</strong>
          <small className={`text-xs ${change.className}`}>{change.text}</small>
        </span>
      ),
    }
  })

  return (
    <main className="min-h-dvh bg-[#f7f8fa]">
      <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#f0f1f3] bg-white px-3 py-1">
        <button
          type="button"
          aria-label="뒤로 가기"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#191f28] active:bg-[#f2f4f6]"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <strong className="block text-[17px] font-bold text-[#191f28]">{name}</strong>
          <span className="block text-xs text-[#8b95a1]">영향력 높은 종목 순</span>
        </div>
      </header>

      <div className="px-2 pb-6">
        {error ? (
          <PopularListError message="종목 목록을 불러오지 못했어요." onRetry={refetch} />
        ) : isLoading ? (
          <PopularListSkeleton />
        ) : (
          <PopularList items={items} expanded />
        )}
      </div>
    </main>
  )
}

export default SectorStocksPage
