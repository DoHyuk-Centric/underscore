import { MenuHistoryCtaSlot } from './MenuHistorySlots'

interface MenuHistoryEmptyProps {
  onClose: () => void
}

export function MenuHistoryEmpty({ onClose }: MenuHistoryEmptyProps) {
  return (
    <ol className="m-0! mt-4! list-none p-0">
      <MenuHistoryCtaSlot label="첫 AI 진단 시작하기" onClose={onClose} />
    </ol>
  )
}
