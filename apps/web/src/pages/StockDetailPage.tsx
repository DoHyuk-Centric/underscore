import { useParams, useLocation, useNavigate, Navigate } from 'react-router-dom'
import type { PopularStock } from '@underscore/shared'
import { StockDetailHeader } from '../features/stock-detail/components/StockDetailHeader'
import { StockPriceSummary } from '../features/stock-detail/components/StockPriceSummary'
import { AiDiagnosisCard } from '../features/stock-detail/components/AiDiagnosisCard'
import { ListError } from '../components/ListError'

type StockDetailLocationState = Omit<PopularStock, 'rank' | 'stockCode'>

function StockDetailPage() {
  const { stockCode = '' } = useParams<{ stockCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as StockDetailLocationState | null

  if (!stockCode) {
    return <Navigate to="/home" replace />
  }

  const stock: PopularStock | null = state
    ? { rank: 0, stockCode, ...state }
    : null

  return (
    <main className="flex min-h-dvh flex-col bg-[#f7f8fa] pb-8">
      <StockDetailHeader stockCode={stockCode} name={state?.name} market={state?.market} />

      {stock ? (
        <div className="flex flex-col gap-3 px-4 pt-3">
          <StockPriceSummary stock={stock} />
          <AiDiagnosisCard stock={stock} />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <ListError
            message="종목 정보를 찾을 수 없어요. 목록에서 다시 선택해주세요."
            retryLabel="홈으로 이동"
            onRetry={() => navigate('/home')}
          />
        </div>
      )}
    </main>
  )
}

export default StockDetailPage
