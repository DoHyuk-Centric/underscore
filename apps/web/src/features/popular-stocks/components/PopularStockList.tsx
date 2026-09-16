import type { PopularStock } from "@underscore/shared";
import { ListError } from "../../../components/ListError";
import { PopularList } from "../../../components/PopularList";
import { PopularListSkeleton } from "../../../components/PopularListSkeleton";
import { getChangeRatePresentation } from "../../../lib/change-rate-presentation";

type Props = {
  expanded: boolean;
  stocks: PopularStock[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

export function PopularStockList({
  expanded,
  stocks,
  isLoading,
  error,
  refetch,
}: Props) {
  if (error) {
    return (
      <ListError message={"인기 종목을 불러오지 못했어요."} onRetry={refetch} />
    );
  }

  if (isLoading) {
    return <PopularListSkeleton />;
  }

  const items = stocks.map((stock) => {
    const change = getChangeRatePresentation(stock.changeRate);

    return {
      key: stock.stockCode,
      rank: stock.rank,
      name: stock.name,
      detail: `${stock.market} · ${stock.stockCode}`,
      right: (
        <span className="grid gap-1 text-right">
          <strong className="text-[15px] text-[#191f28]">
            {stock.price.toLocaleString()}원
          </strong>
          <small className={`text-xs ${change.className}`}>{change.text}</small>
        </span>
      ),
    };
  });

  return <PopularList items={items} expanded={expanded} />;
}
