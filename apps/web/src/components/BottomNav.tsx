import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/home', label: '홈', Icon: HomeIcon },
  { to: '/ai', label: 'AI', Icon: AiIcon },
  { to: '/history', label: '기록', Icon: HistoryIcon },
] as const

export function BottomNav() {
  return (
    <nav
      className="flex shrink-0 h-14 bg-white border-t border-[#f0f1f3] pb-[env(safe-area-inset-bottom)]"
      aria-label="주요 메뉴"
    >
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold no-underline ${
              isActive ? 'text-[#3182f6]' : 'text-[#8b95a1]'
            }`
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0A1.5 1.5 0 0 1 13.5 15v5H17a1 1 0 0 0 1-1v-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AiIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="6.5" r="1.1" fill="currentColor" />
      <rect
        x="4.5"
        y="8"
        width="15"
        height="11"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M2.5 12.5v3M21.5 12.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="13.5" r="1.4" fill="currentColor" />
      <circle cx="15" cy="13.5" r="1.4" fill="currentColor" />
      <path d="M9.5 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 7v5l3.2 2M20 12a8 8 0 1 1-2.6-5.9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 4v3.5h-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
