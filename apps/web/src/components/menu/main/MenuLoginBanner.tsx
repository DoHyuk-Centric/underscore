import { ChevronRight, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

interface MenuLoginBannerProps {
  onClose: () => void
}

export function MenuLoginBanner({ onClose }: MenuLoginBannerProps) {
  return (
    <Link to="/login" onClick={onClose} className="relative isolate flex items-center gap-4 rounded-2xl px-4 py-4 text-[#191f28]! no-underline! hover:text-[#191f28]! hover:no-underline! will-change-[scale] transition-transform duration-300 ease-spring active:scale-[0.96] before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-[rgba(2,32,71,0.05)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-spring active:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6] motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:active:scale-100">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#3182f6]">
        <UserRound size={27} strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xl font-bold tracking-tight">로그인하고 시작하세요</span>
        <span className="mt-1 block text-[13px] leading-5 text-[#8b95a1]">나만의 투자 기준을 쌓아가는 곳</span>
      </span>
      <ChevronRight size={20} className="shrink-0 text-[#b0b8c1]" aria-hidden="true" />
    </Link>
  )
}
