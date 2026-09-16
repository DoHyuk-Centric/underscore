import type { PopularSector } from "@underscore/shared";
import { ListError } from "../../../components/ListError";
import { PopularList } from "../../../components/PopularList";
import { PopularListSkeleton } from "../../../components/PopularListSkeleton";
import { getChangeRatePresentation } from "../../../lib/change-rate-presentation";

type Props = {
  expanded: boolean;
  sectors: PopularSector[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
};

function formatTradingValue(value: number): string {
  const 조 = 1_000_000_000_000;
  const 억 = 100_000_000;

  if (value >= 조) {
    return `${(value / 조).toFixed(1)}조원`;
  }
  return `${Math.round(value / 억).toLocaleString()}억원`;
}

export function PopularSectorList({
  expanded,
  sectors,
  isLoading,
  error,
  refetch,
}: Props) {
  if (error) {
    return (
      <ListError message="인기 섹터를 불러오지 못했어요." onRetry={refetch} />
    );
  }

  if (isLoading) {
    return <PopularListSkeleton />;
  }

  const items = sectors.map((sector) => {
    const change = getChangeRatePresentation(sector.changeRate);

    return {
      key: sector.name,
      rank: sector.rank,
      name: sector.name,
      detail: formatTradingValue(sector.tradingValue),
      right: <strong className={`text-[15px] ${change.className}`}>{change.text}</strong>,
    };
  });

  return <PopularList items={items} expanded={expanded} />;
}
