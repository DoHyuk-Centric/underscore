interface MenuHistoryErrorProps {
  onRetry: () => void
}

export function MenuHistoryError({ onRetry }: MenuHistoryErrorProps) {
  return (
    <ol className="m-0! mt-4! list-none p-0">
      <li>
        <button
          type="button"
          onClick={onRetry}
          className="relative isolate -mx-2 -my-1.5 flex w-[calc(100%+1rem)] cursor-pointer gap-3.5 rounded-xl! border-0 bg-transparent px-2 py-1.5 text-left will-change-[scale] transition-transform duration-300 ease-spring active:scale-[0.96] before:absolute before:inset-0 before:-z-10 before:rounded-xl before:bg-[rgba(2,32,71,0.05)] before:opacity-0 before:transition-opacity before:duration-300 before:ease-spring active:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3182f6] motion-reduce:transition-none motion-reduce:before:transition-none motion-reduce:active:scale-100"
        >
          <span aria-hidden="true" className="flex w-2.5 shrink-0 justify-center">
            <span className="mt-1 size-2.5 rounded-full border-2 border-[#f04452] bg-white" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.75">
            <span className="text-xs font-medium text-[#8b95a1]">기록을 불러오지 못했어요</span>
            <span className="text-[15px] font-semibold text-[#3182f6]">다시 시도</span>
          </span>
        </button>
      </li>
    </ol>
  )
}
