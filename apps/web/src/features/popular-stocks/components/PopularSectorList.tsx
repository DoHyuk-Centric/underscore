import { ListRow } from '@toss/tds-mobile'

const popularSectors = [
  { rank: 1, name: '2차전지', detail: '거래대금 1.8조원', value: '-4.28%', change: '하락' },
  { rank: 2, name: '반도체', detail: '거래대금 4.2조원', value: '+3.42%', change: '상승' },
  { rank: 3, name: '게임', detail: '거래대금 6,420억원', value: '-3.12%', change: '하락' },
  { rank: 4, name: '자동차', detail: '거래대금 1.8조원', value: '+2.18%', change: '상승' },
  { rank: 5, name: '바이오', detail: '거래대금 9,430억원', value: '+1.67%', change: '상승' },
  { rank: 6, name: '증권', detail: '거래대금 7,850억원', value: '+1.42%', change: '상승' },
  { rank: 7, name: '화학', detail: '거래대금 8,120억원', value: '-1.31%', change: '하락' },
  { rank: 8, name: '조선', detail: '거래대금 1.1조원', value: '+1.18%', change: '상승' },
  { rank: 9, name: '인터넷', detail: '거래대금 5,970억원', value: '-1.04%', change: '하락' },
  { rank: 10, name: '금융', detail: '거래대금 8,760억원', value: '+0.92%', change: '상승' },
]

const INITIAL_ITEM_COUNT = 5
type Props = { expanded: boolean }

export function PopularSectorList({ expanded }: Props) {
  return (
    <ol className="m-0 list-none p-0">
      {popularSectors.map((item, index) => {
        const color = item.value.startsWith('+') ? 'text-[#f04452]' : 'text-[#3182f6]'
        const isExtra = index >= INITIAL_ITEM_COUNT
        const hasDivider = index < popularSectors.length - 1

        return (
          <li
            key={item.name}
            className={`${hasDivider ? 'border-b border-[#f0f1f3]' : ''} ${isExtra ? `popular-stocks__extra ${expanded ? 'popular-stocks__extra--open' : ''}` : ''}`}
            aria-hidden={isExtra ? !expanded : undefined}
          >
            <div className="min-h-0 overflow-hidden">
              <ListRow
                left={<span className="inline-block w-5 text-center text-[15px] font-bold text-[#6b7684]">{item.rank}</span>}
                contents={<span className="grid gap-1"><strong className="text-[15px] text-[#191f28]">{item.name}</strong><small className="text-xs text-[#8b95a1]">{item.detail}</small></span>}
                right={<span className="grid gap-1 text-right"><strong className={`text-[15px] ${color}`}>{item.value}</strong><small className={`text-xs ${color}`}>{item.change}</small></span>}
                border="none"
                horizontalPadding="small"
                verticalPadding="medium"
                withTouchEffect
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
