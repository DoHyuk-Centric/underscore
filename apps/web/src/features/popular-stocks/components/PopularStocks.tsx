import { useState } from 'react'
import { ListFooter, ListHeader, ListRow, SegmentedControl } from '@toss/tds-mobile'

type PopularTab = 'stocks' | 'sectors'

const popularStocks = [
  { rank: 1, name: '삼성전자', detail: '005930', value: '72,300원', change: '+1.26%' },
  { rank: 2, name: 'SK하이닉스', detail: '000660', value: '184,500원', change: '-0.54%' },
  { rank: 3, name: 'NAVER', detail: '035420', value: '201,000원', change: '+0.80%' },
  { rank: 4, name: '현대차', detail: '005380', value: '248,500원', change: '+0.40%' },
  { rank: 5, name: '카카오', detail: '035720', value: '42,150원', change: '-1.06%' },
  { rank: 6, name: '기아', detail: '000270', value: '118,200원', change: '+0.34%' },
  { rank: 7, name: '셀트리온', detail: '068270', value: '182,400원', change: '-0.82%' },
  { rank: 8, name: 'POSCO홀딩스', detail: '005490', value: '371,500원', change: '+0.55%' },
  { rank: 9, name: 'LG에너지솔루션', detail: '373220', value: '345,000원', change: '-1.24%' },
  { rank: 10, name: 'KB금융', detail: '105560', value: '84,700원', change: '+0.71%' },
]

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

export function PopularStocks() {
  const [selectedTab, setSelectedTab] = useState<PopularTab>('stocks')
  const [expanded, setExpanded] = useState(false)
  const isStockTab = selectedTab === 'stocks'
  const items = isStockTab ? popularStocks : popularSectors
  const primaryItems = items.slice(0, INITIAL_ITEM_COUNT)
  const extraItems = items.slice(INITIAL_ITEM_COUNT)

  const changeTab = (value: string) => {
    setSelectedTab(value as PopularTab)
    setExpanded(false)
  }

  const renderItems = (listItems: typeof items, connectsToNext = false) =>
    listItems.map((item, index) => {
      const isRising = item.value.startsWith('+')
      const isLast = index === listItems.length - 1

      return (
        <ListRow
          key={item.name}
          left={<span className="popular-stocks__rank">{item.rank}</span>}
          contents={
            <span className="popular-stocks__identity">
              <strong>{item.name}</strong>
              <small>{item.detail}</small>
            </span>
          }
          right={
            <span className="popular-stocks__quote">
              <strong className={isStockTab ? undefined : isRising ? 'stock-change--up' : 'stock-change--down'}>
                {item.value}
              </strong>
              <small className={isRising ? 'stock-change--up' : 'stock-change--down'}>
                {item.change}
              </small>
            </span>
          }
          border={isLast && !connectsToNext ? 'none' : 'indented'}
          horizontalPadding="small"
          verticalPadding="medium"
          withTouchEffect
        />
      )
    })

  return (
    <section className="popular-stocks" aria-labelledby="popular-list-title">
      <SegmentedControl
        className="popular-stocks__tabs"
        size="small"
        value={selectedTab}
        onChange={changeTab}
      >
        <SegmentedControl.Item value="stocks">인기 종목</SegmentedControl.Item>
        <SegmentedControl.Item value="sectors">인기 섹터</SegmentedControl.Item>
      </SegmentedControl>

      <ListHeader
        title={
          <ListHeader.TitleParagraph id="popular-list-title">
            {isStockTab ? '오늘 거래가 많은 종목' : '오늘 많이 움직인 섹터'}
          </ListHeader.TitleParagraph>
        }
        description={
          <ListHeader.DescriptionParagraph>
            {isStockTab ? '거래대금 기준' : '업종지수 등락률 기준'}
          </ListHeader.DescriptionParagraph>
        }
        descriptionPosition="bottom"
        size="medium"
      />

      <ol className="popular-stocks__list">
        {renderItems(primaryItems, expanded)}
      </ol>

      <div
        className={`popular-stocks__extra ${expanded ? 'popular-stocks__extra--open' : ''}`}
        aria-hidden={!expanded}
      >
        <ol className="popular-stocks__list" start={INITIAL_ITEM_COUNT + 1}>
          {renderItems(extraItems)}
        </ol>
      </div>

      <ul className="popular-stocks__list">
        <ListFooter
          border="none"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? '접기' : '더보기'}
        </ListFooter>
      </ul>
    </section>
  )
}
