import { MenuHistoryCtaSlot, MenuHistoryPlaceholderSlots } from './MenuHistorySlots'

interface MenuHistoryEmptyProps {
  slotCount: number
  onClose: () => void
}

export function MenuHistoryEmpty({ slotCount, onClose }: MenuHistoryEmptyProps) {
  return (
    <ol className="m-0! mt-4! flex list-none flex-col gap-4.5 p-0">
      <MenuHistoryCtaSlot label="첫 AI 진단 시작하기" onClose={onClose} />
      <MenuHistoryPlaceholderSlots count={slotCount - 1} />
    </ol>
  )
}
