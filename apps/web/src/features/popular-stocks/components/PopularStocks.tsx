import { useState } from 'react'
import { ListFooter, ListHeader, SegmentedControl } from '@toss/tds-mobile'
import { PopularSectorList } from './PopularSectorList'
import { PopularStockList } from './PopularStockList'

type PopularTab = 'stocks' | 'sectors'

export function PopularStocks() {
  const [selectedTab, setSelectedTab] = useState<PopularTab>('stocks')
  const [expanded, setExpanded] = useState(false)
  const isStockTab = selectedTab === 'stocks'

  const changeTab = (value: string) => {
    setSelectedTab(value as PopularTab)
    setExpanded(false)
  }

  return (
    <section aria-labelledby="popular-list-title">
      <SegmentedControl className="px-2" size="small" value={selectedTab} onChange={changeTab}>
        <SegmentedControl.Item value="stocks">인기 종목</SegmentedControl.Item>
        <SegmentedControl.Item value="sectors">인기 섹터</SegmentedControl.Item>
      </SegmentedControl>

      <ListHeader
        title={<ListHeader.TitleParagraph id="popular-list-title">{isStockTab ? '오늘 거래대금이 많은 종목' : '오늘 많이 움직인 섹터'}</ListHeader.TitleParagraph>}
        description={<ListHeader.DescriptionParagraph>{isStockTab ? '거래대금 기준' : '업종지수 등락률 기준'}</ListHeader.DescriptionParagraph>}
        descriptionPosition="bottom"
        size="medium"
      />

      {isStockTab ? <PopularStockList expanded={expanded} /> : <PopularSectorList expanded={expanded} />}

      <ul className="m-0 p-0 list-none">
        <ListFooter border="none" shadow={<></>} aria-expanded={expanded} onClick={() => setExpanded((current) => !current)}>
          {expanded ? '접기' : '더보기'}
        </ListFooter>
      </ul>
    </section>
  )
}
