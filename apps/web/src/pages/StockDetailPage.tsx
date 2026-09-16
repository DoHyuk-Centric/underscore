import { useParams, useLocation, Navigate } from 'react-router-dom'
import { StockDetailHeader } from '../features/stock-detail/components/StockDetailHeader'
import { StockPriceSummary } from '../features/stock-detail/components/StockPriceSummary'
import { StockChart } from '../features/stock-detail/components/StockChart'
import { StockInfoGrid } from '../features/stock-detail/components/StockInfoGrid'
import { StockDetailSkeleton } from '../features/stock-detail/components/StockDetailSkeleton'
import { ListError } from '../components/ListError'
import { useStockDetail } from '../features/stock-detail/hooks/useStockDetail'
import type { Market } from '../features/stock-detail/mock/stock-detail-mock'
import '../features/stock-detail/stock-detail.css'

type StockDetailLocationState = {
  name?: string
  market?: Market
  price?: number
  change?: number
  changeRate?: number
  volume?: number
  tradingValue?: number
}

function StockDetailPage() {
  const { stockCode = '' } = useParams<{ stockCode: string }>()
  const location = useLocation()
  const state = (location.state ?? {}) as StockDetailLocationState
  const { stock, isLoading, error, refetch } = useStockDetail({ stockCode, ...state })

  if (!stockCode) {
    return <Navigate to="/home" replace />
  }

  return (
    <main className="stock-detail">
      <StockDetailHeader stockCode={stockCode} name={stock?.name ?? state.name} market={stock?.market ?? state.market} />

      {error ? (
        <ListError message="종목 정보를 불러오지 못했어요." onRetry={refetch} />
      ) : isLoading || !stock ? (
        <StockDetailSkeleton />
      ) : (
        <div className="stock-detail__content">
          <section className="stock-detail__overview" aria-label="주가와 차트">
            <StockPriceSummary stock={stock} />
            <StockChart key={stockCode} charts={stock.charts} dayChangeRate={stock.changeRate} />
          </section>
          <StockInfoGrid stock={stock} />
          <p className="stock-detail__notice">현재 상세 정보와 차트에는 예시 데이터가 포함되어 있어요.</p>
        </div>
      )}
    </main>
  )
}

export default StockDetailPage
