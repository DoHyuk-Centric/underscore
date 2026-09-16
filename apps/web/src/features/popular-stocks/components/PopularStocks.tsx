import { useState } from "react";
import { ListHeader, SegmentedControl } from "@toss/tds-mobile";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PopularSectorList } from "./PopularSectorList";
import { PopularStockList } from "./PopularStockList";
import { usePopularStocks } from "../hooks/usePopularStocks";
import { usePopularSectors } from "../../popular-sector/hooks/usePopularSectors";
import "../../../components/PopularList.css";

type PopularTab = "stocks" | "sectors";

export function PopularStocks() {
  const [selectedTab, setSelectedTab] = useState<PopularTab>("stocks");
  const [expanded, setExpanded] = useState(false);
  const isStockTab = selectedTab === "stocks";

  const stockState = usePopularStocks();
  const sectorState = usePopularSectors();
  const activeItemCount = isStockTab
    ? stockState.stocks.length
    : sectorState.sectors.length;
  const activeState = isStockTab ? stockState : sectorState;
  const canExpand = !activeState.isLoading && activeItemCount > 5;
  const hideFooter = Boolean(activeState.error) && activeItemCount === 0;

  const toggleExpanded = () => {
    if (!canExpand) return;
    setExpanded((current) => !current);
  };

  const changeTab = (value: string) => {
    setSelectedTab(value as PopularTab);
    setExpanded(false);
  };

  return (
    <section
      className="popular-list relative z-1 flex flex-col"
      aria-labelledby="popular-list-title"
    >
      <SegmentedControl
        className="px-2"
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
            {isStockTab ? "현재 거래대금이 많은 종목" : "현재 많이 상승한 섹터"}
          </ListHeader.TitleParagraph>
        }
        description={
          <ListHeader.DescriptionParagraph>
            {isStockTab ? "거래대금 기준" : "업종지수 등락률 기준"}
          </ListHeader.DescriptionParagraph>
        }
        descriptionPosition="bottom"
        size="medium"
      />

      <div className="popular-list__slot" data-expanded={expanded} aria-busy={activeState.isLoading}>
        {isStockTab ? (
          <PopularStockList expanded={expanded} {...stockState} />
        ) : (
          <PopularSectorList expanded={expanded} {...sectorState} />
        )}
      </div>

      <button
        type="button"
        className="popular-list__footer"
        aria-hidden={hideFooter}
        disabled={!canExpand}
        aria-expanded={expanded}
        aria-label={expanded ? "인기 목록 접기" : "인기 목록 더 보기"}
        onClick={toggleExpanded}
      >
        {expanded ? "접기" : "더 보기"}
        {expanded ? (
          <ChevronUp size={18} aria-hidden="true" />
        ) : (
          <ChevronDown size={18} aria-hidden="true" />
        )}
      </button>
    </section>
  );
}
