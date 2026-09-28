import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MenuHistoryEmpty } from './MenuHistoryEmpty'
import { MenuHistoryList } from './MenuHistoryList'
import { MenuHistorySkeleton } from './MenuHistorySkeleton'

export interface AnalysisRecord {
  id: string
  stockName: string
  stockCode: string
  analyzedAt: string
}

interface MenuHistoryProps {
  records: AnalysisRecord[]
  isLoading: boolean
  onClose: () => void
}

export const MAX_RECENT_RECORDS = 3

export function MenuHistory({ records, isLoading, onClose }: MenuHistoryProps) {
  const recentRecords = records.slice(0, MAX_RECENT_RECORDS)
  const isEmpty = recentRecords.length === 0

  const renderContent = () => {
    if (isLoading) {
      return <MenuHistorySkeleton />
    }
    if (isEmpty) {
      return <MenuHistoryEmpty slotCount={MAX_RECENT_RECORDS} onClose={onClose} />
    }
    return <MenuHistoryList records={recentRecords} slotCount={MAX_RECENT_RECORDS} onClose={onClose} />
  }

  return (
    <section aria-labelledby="menu-history-title" aria-busy={isLoading} className="mt-5 rounded-[20px] bg-[#f7f8fa] p-5">
      <div className="flex items-center justify-between">
        <h3 id="menu-history-title" className="m-0! text-[13px] font-semibold text-[#6b7684]">최근 기록</h3>
        {!isLoading && !isEmpty && (
          <Link
            to="/history"
            onClick={onClose}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[#8b95a1]! no-underline! hover:text-[#6b7684]! hover:no-underline! focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6]"
          >
            전체보기
            <ChevronRight size={12} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        )}
      </div>
      {renderContent()}
    </section>
  )
}
