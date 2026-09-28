import type { Plan } from '../../PlanBadge'
import { MenuHistory, type AnalysisRecord } from './history/MenuHistory'
import { MenuLoginBanner } from './MenuLoginBanner'
import { MenuUsageSummary } from './MenuUsageSummary'

interface MenuMainProps {
  plan: Plan
  records: AnalysisRecord[]
  isRecordsLoading: boolean
  isRecordsError: boolean
  onRetryRecords: () => void
  onClose: () => void
}

export function MenuMain({ plan, records, isRecordsLoading, isRecordsError, onRetryRecords, onClose }: MenuMainProps) {
  return (
    <div className="flex-1 px-5 pt-2">
      <div className="mx-auto w-full max-w-lg">
        <MenuLoginBanner onClose={onClose} />
        <MenuUsageSummary plan={plan} />
        <MenuHistory
          records={records}
          isLoading={isRecordsLoading}
          isError={isRecordsError}
          onRetry={onRetryRecords}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
