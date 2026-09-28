export function MenuFooter() {
  return (
    <footer className="mt-6 px-5 pb-8">
      <div className="mx-auto w-full max-w-lg">
        <nav aria-label="이용 안내" className="border-t border-[#f0f1f3] pt-5">
          <h3 className="m-0 mb-2 px-1 text-xs font-semibold text-[#8b95a1]">Contact</h3>
          <a href="https://open.kakao.com/o/sgiUE8Mi" target="_blank" rel="noreferrer" className="relative isolate flex min-h-14 items-center gap-3.5 rounded-xl px-3 text-sm font-medium text-[#4e5968]! no-underline! hover:text-[#4e5968]! hover:no-underline! will-change-[scale] transition-transform duration-300 ease-spring active:scale-[0.96] before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-[rgba(2,32,71,0.05)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-spring active:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6] motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:active:scale-100">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fee500] text-[#302621]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 4C6.48 4 3 7.02 3 10.7c0 2.35 1.55 4.43 4 5.62l-.8 3.18 3.5-2.24c.74.13 1.51.2 2.3.2 5.52 0 9-3.03 9-6.76S17.52 4 12 4Z" fill="currentColor" />
                <path d="M8 10.5h8" stroke="#FEE500" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex-1">의견 보내기<span className="sr-only"> (새 창)</span></span>
          </a>
        </nav>
        <p className="m-0 pt-4 text-center text-xs tracking-tight text-[#b0b8c1]">나의 판단에, 밑줄.</p>
      </div>
    </footer>
  )
}
