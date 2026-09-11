import { useState } from 'react'
import { ListFooter, ListHeader, SegmentedControl } from '@toss/tds-mobile'
import { PopularSectorList } from './PopularSectorList'
import { PopularStockList } from './PopularStockList'

type PopularTab = 'stocks' | 'sectors'

export function PopularStocks() {
  const [selectedTab, setSelectedTab] = useState<PopularTab>('stocks')
  const [expanded, setExpanded] = useState(false)
  const [hasStockError, setHasStockError] = useState(false)
  const isStockTab = selectedTab === 'stocks'

  const changeTab = (value: string) => {
    setSelectedTab(value as PopularTab)
    setExpanded(false)
    setHasStockError(false)
  }

  return (
    <section className="relative z-1 flex grow shrink-0 flex-col" aria-labelledby="popular-list-title">
      <SegmentedControl className="px-2" size="small" value={selectedTab} onChange={changeTab}>
        <SegmentedControl.Item value="stocks">인기 종목</SegmentedControl.Item>
        <SegmentedControl.Item value="sectors">인기 섹터</SegmentedControl.Item>
      </SegmentedControl>

      <ListHeader
        title={<ListHeader.TitleParagraph id="popular-list-title">{isStockTab ? '현재 거래대금이 많은 종목' : '현재 많이 상승한 섹터'}</ListHeader.TitleParagraph>}
        description={<ListHeader.DescriptionParagraph>{isStockTab ? '거래대금 기준' : '업종지수 등락률 기준'}</ListHeader.DescriptionParagraph>}
        descriptionPosition="bottom"
        size="medium"
      />

      {isStockTab ? <PopularStockList expanded={expanded} onErrorChange={setHasStockError} /> : <PopularSectorList expanded={expanded} />}

      {!isStockTab || !hasStockError ? <ul className="m-0 list-none p-0">
        <ListFooter
          icon={expanded ? 'icon-arrow-up-mono' : 'icon-arrow-down-mono'}
          iconColor="#6b7684"
          textColor="#6b7684"
          border="none"
          shadow={<ListFooter.Shadow style={{ background: 'radial-gradient(closest-side, #e8f3ff 0%, transparent 100%)' }} />}
          aria-expanded={expanded}
          aria-label={expanded ? '인기 목록 접기' : '인기 목록 더 보기'}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? '접기' : '더 보기'}
        </ListFooter>
      </ul> : null}
    </section>
  )
}
