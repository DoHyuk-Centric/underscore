import { IconButton } from "@toss/tds-mobile";

interface HeaderProps {
  isMenuOpen: boolean;
  onMenuOpen: () => void;
}

export function Header({ isMenuOpen, onMenuOpen }: HeaderProps) {
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
        name="icon-line-three-mono"
        variant="clear"
        color="#4E5968"
        iconSize={24}
        aria-label="메뉴 열기"
        aria-expanded={isMenuOpen}
        aria-controls="fullscreen-navigation-menu"
        aria-haspopup="dialog"
        onClick={onMenuOpen}
      />
    </header>
  );
}
