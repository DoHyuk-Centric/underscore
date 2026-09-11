import { IconButton } from '@toss/tds-mobile'

export function Header() {
  return (
    <header className="flex items-center justify-between py-1 px-3 bg-white border-b border-[#f0f1f3]">
      <div className="flex items-center gap-2 text-[#191f28] text-xl font-extrabold tracking-tighter">
        <img
          className="w-7 h-7 object-contain"
          src="/mitjul-logo-04-black.svg"
          alt=""
          aria-hidden="true"
        />
        밑줄
      </div>
      <IconButton
        src="/icon-menu.svg"
        aria-label="메뉴 열기"
        bgColor="transparent"
        iconSize={24}
      />
    </header>
  )
}
