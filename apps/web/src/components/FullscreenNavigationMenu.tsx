import { Link } from 'react-router-dom'
import { MenuLayout } from './MenuLayout'

interface FullscreenNavigationMenuProps {
  open: boolean
  onClose: () => void
}

export function FullscreenNavigationMenu({ open, onClose }: FullscreenNavigationMenuProps) {
  return (
    <MenuLayout open={open} onClose={onClose}>
    <Link
      to="/login"
      onClick={onClose}
      className="flex min-h-24 items-center gap-4 rounded-2xl py-4 text-[#191f28] no-underline transition-colors hover:bg-[#f9fafb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3182f6]"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f2f4f6] text-[#8b95a1]">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" fill="currentColor" />
          <path d="M5 20v-1a7 7 0 0 1 14 0v1" fill="currentColor" />
        </svg>
      </span>
      <span className="flex-1 text-2xl font-bold tracking-tight">Login</span>
      <svg className="mr-2 h-5 w-5 shrink-0 text-[#b0b8c1]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>

    <dl className="mt-8 rounded-3xl bg-[#f9fafb] px-6">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-3 py-5">
        <dt className="text-base font-medium text-[#4e5968]">구독 상태</dt>
        <dd className="rounded-lg bg-[#eef0f3] px-3 py-1.5 text-sm font-semibold text-[#6b7684]">
          미확인
        </dd>
      </div>
      <div className="flex min-h-24 flex-wrap items-center justify-between gap-3 border-t border-[#eceef1] py-5">
        <dt className="text-base font-medium text-[#4e5968]">남은 횟수</dt>
        <dd className="flex items-baseline gap-1.5" aria-label="남은 횟수 미확인">
          <span aria-hidden="true" className="text-3xl font-bold tabular-nums tracking-tight text-[#3182f6]">—</span>
          <span aria-hidden="true" className="text-base font-medium text-[#8b95a1]">회</span>
        </dd>
      </div>
    </dl>
    </MenuLayout>
  )
}
