import { Link } from 'react-router-dom'
import type { AnalysisRecord } from './MenuHistory'
import { MenuHistoryCtaSlot } from './MenuHistorySlots'

interface MenuHistoryListProps {
  records: AnalysisRecord[]
  slotCount: number
  onClose: () => void
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}.${day}`
}

export function MenuHistoryList({ records, slotCount, onClose }: MenuHistoryListProps) {
  return (
    <ol className="m-0! mt-4! flex list-none flex-col gap-4.5 p-0">
      {records.map((record, index) => (
        <li key={record.id}>
          <Link
            to={`/history/${record.id}`}
            onClick={onClose}
            className="relative isolate -mx-2 -my-1.5 flex gap-3.5 rounded-xl px-2 py-1.5 no-underline! hover:no-underline! will-change-[scale] transition-transform duration-300 ease-spring active:scale-[0.96] before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-[rgba(2,32,71,0.05)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-spring active:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6] motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:active:scale-100"
          >
            <span aria-hidden="true" className="flex w-2.5 shrink-0 justify-center">
              <span className={`mt-1 size-2.5 rounded-full ${index === 0 ? 'bg-[#3182f6]' : 'bg-[#c9cfd6]'}`} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.75">
              <time dateTime={record.analyzedAt} className="text-xs font-medium text-[#8b95a1] tabular-nums">
                {formatDate(record.analyzedAt)}
              </time>
              <span className="truncate">
                <span className="text-[15px] text-[#191f28]">{record.stockName}</span>
                <span className="ml-1.5 text-[13px] text-[#8b95a1] tabular-nums">{record.stockCode}</span>
              </span>
            </span>
          </Link>
        </li>
      ))}
      {records.length < slotCount && <MenuHistoryCtaSlot label="AI 진단 더 해보기" onClose={onClose} />}
    </ol>
  )
}
