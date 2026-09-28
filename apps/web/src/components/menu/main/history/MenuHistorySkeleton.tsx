const placeholderWidths = ['52%', '40%', '60%']

export function MenuHistorySkeleton() {
  return (
    <ol aria-hidden="true" className="m-0! mt-4! list-none p-0">
      {placeholderWidths.map((width, index) => (
        <li key={width} className={`flex gap-3.5 ${index === placeholderWidths.length - 1 ? '' : 'pb-4.5'}`}>
          <span className="flex w-2.5 shrink-0 justify-center">
            <span className="mt-1 size-2.5 rounded-full bg-[#c9cfd6]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.75">
            <span className="flex h-4 items-center">
              <span className="h-2 w-8.5 animate-pulse rounded-full bg-[#e9ecef]" />
            </span>
            <span className="flex h-5.5 items-center">
              <span className="h-2.5 animate-pulse rounded-full bg-[#e9ecef]" style={{ width }} />
            </span>
          </span>
        </li>
      ))}
    </ol>
  )
}
