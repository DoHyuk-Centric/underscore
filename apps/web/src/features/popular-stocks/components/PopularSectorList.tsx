import type { PopularSector } from "@underscore/shared";
import { ListError } from "../../../components/ListError";
import { PopularList } from "../../../components/PopularList";
import { PopularListSkeleton } from "../../../components/PopularListSkeleton";

type Props = {
  expanded: boolean;
  sectors: PopularSector[];
  isLoading: boolean;
  error: unknown;
  retry: () => void;
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
  retry,
}: Props) {
  if (error) {
    return (
      <ListError message="인기 섹터를 불러오지 못했어요." onRetry={retry} />
    );
  }

  if (isLoading) {
    return <PopularListSkeleton />;
  }

  const items = sectors.map((sector) => {
    const color = sector.changeRate >= 0 ? "text-[#f04452]" : "text-[#3182f6]";
    const changeText = `${sector.changeRate >= 0 ? "+" : ""}${sector.changeRate.toFixed(2)}%`;

    return {
      key: sector.name,
      rank: sector.rank,
      name: sector.name,
      detail: formatTradingValue(sector.tradingValue),
      right: <strong className={`text-[15px] ${color}`}>{changeText}</strong>,
    };
  });

  return <PopularList items={items} expanded={expanded} />;
}
