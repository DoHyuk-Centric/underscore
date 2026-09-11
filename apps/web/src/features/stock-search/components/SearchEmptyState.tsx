import type { ReactNode } from 'react'

type SearchEmptyStateProps = {
  icon: string
  title: string
  children?: ReactNode
}

export function SearchEmptyState({ icon, title, children }: SearchEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center -translate-y-8">
      <span className="text-[#eef0f2] text-[120px] font-bold leading-none" aria-hidden="true">
        {icon}
      </span>
      <p className="text-[#191f28] text-sm font-medium">{title}</p>
      {children}
    </div>
  )
}
