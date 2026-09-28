import { Sparkles } from 'lucide-react'

export type Plan = 'free' | 'pro'

interface PlanBadgeProps {
  plan: Plan
}

const plans = {
  free: { label: 'Free', style: 'border-[#dfe3e8] bg-[#eef0f3] text-[#4e5968]' },
  pro: { label: 'Pro', style: 'border-[#c5dcff] bg-[#eaf3ff] text-[#1b64da]' },
} satisfies Record<Plan, { label: string; style: string }>

export function PlanBadge({ plan }: PlanBadgeProps) {
  const { label, style } = plans[plan]

  return (
    <span className={`inline-flex h-7 min-w-16 items-center justify-center gap-1 rounded-full border px-2.5 text-xs leading-none font-bold tracking-[0.1px] whitespace-nowrap align-middle ${style}`}>
      {plan === 'pro' && <Sparkles size={12} strokeWidth={1.8} aria-hidden="true" />}
      {label}
    </span>
  )
}
