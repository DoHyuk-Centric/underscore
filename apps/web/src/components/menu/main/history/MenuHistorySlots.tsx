import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MenuHistoryCtaSlotProps {
  label: string
  onClose: () => void
}

export function MenuHistoryCtaSlot({ label, onClose }: MenuHistoryCtaSlotProps) {
  return (
    <li>
      <Link
        to="/ai"
        onClick={onClose}
        className="relative isolate -mx-2 -my-1.5 flex gap-3.5 rounded-xl px-2 py-1.5 no-underline! hover:no-underline! will-change-[scale] transition-transform duration-300 ease-spring active:scale-[0.96] before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-[rgba(2,32,71,0.05)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-spring active:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6] motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:active:scale-100"
      >
        <span aria-hidden="true" className="flex w-2.5 shrink-0 justify-center">
          <span className="mt-1 size-2.5 rounded-full border-2 border-[#3182f6] bg-white" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.75">
          <span aria-hidden="true" className="text-xs font-medium text-[#8b95a1]">오늘</span>
          <span className="text-[15px] font-semibold text-[#3182f6]">{label}</span>
        </span>
        <ChevronRight size={16} strokeWidth={2.2} className="shrink-0 self-center text-[#3182f6]" aria-hidden="true" />
      </Link>
    </li>
  )
}
