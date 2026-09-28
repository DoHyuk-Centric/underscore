import { IconButton } from '@toss/tds-mobile'
import type { RefObject } from 'react'

interface MenuHeaderProps {
  closeButtonRef: RefObject<HTMLButtonElement>
  onClose: () => void
}

const CLOSE_ICON_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="#4E5968" stroke-width="2" stroke-linecap="round"/></svg>',
)}`

export function MenuHeader({ closeButtonRef, onClose }: MenuHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[#f0f1f3] bg-white px-3 py-1">
      <h2 id="fullscreen-navigation-title" className="m-0! pl-3 text-xl font-extrabold tracking-tighter text-[#191f28]">
        전체 메뉴
      </h2>
      <IconButton
        ref={closeButtonRef}
        src={CLOSE_ICON_SRC}
        variant="clear"
        iconSize={24}
        aria-label="메뉴 닫기"
        onClick={onClose}
      />
    </header>
  )
}
