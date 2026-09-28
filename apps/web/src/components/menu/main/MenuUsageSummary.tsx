import { PlanBadge, type Plan } from '../../PlanBadge'

interface MenuUsageSummaryProps {
  plan: Plan
}

export function MenuUsageSummary({ plan }: MenuUsageSummaryProps) {
  return (
    <section aria-labelledby="menu-usage-title" className="mt-5 rounded-[20px] bg-[#f7f8fa] p-5">
      <h3 id="menu-usage-title" className="m-0 text-[13px] font-semibold text-[#6b7684]">내 이용 현황</h3>
      <dl className="m-0! mt-4! grid grid-cols-2 divide-x divide-[#e5e8eb]">
        <div className="flex flex-col gap-2 justify-center pr-4 text-center">
          <dt className="text-xs text-[#8b95a1]">구독 상태</dt>
          <dd className="m-0!"><PlanBadge plan={plan} /></dd>
        </div>
        <div className="flex flex-col gap-2 justify-center pl-5 text-center">
          <dt className="text-xs text-[#8b95a1]">남은 분석 횟수</dt>
          <dd className="m-0! flex items-baseline justify-center gap-1 text-[#3182f6]" aria-label="남은 분석 횟수 5회">
            <span aria-hidden="true" className="text-2xl font-bold">5</span>
            <span aria-hidden="true" className="text-sm font-medium text-[#8b95a1]">회</span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
