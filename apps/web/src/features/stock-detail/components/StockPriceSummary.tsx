import type { PopularStock } from "@underscore/shared";
import { getChangeRatePresentation } from "../../../lib/change-rate-presentation";

const formatTradingValue = (value: number): string => {
  const 조 = 1_000_000_000_000;
  const 억 = 100_000_000;

  if (value >= 조) return `${(value / 조).toFixed(1)}조원`;
  return `${Math.round(value / 억).toLocaleString()}억원`;
};

type Props = {
  stock: PopularStock;
};

export const StockPriceSummary = ({ stock }: Props) => {
  const change = getChangeRatePresentation(stock.changeRate);
  const changeSign = stock.change > 0 ? "+" : stock.change < 0 ? "-" : "";

  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-baseline gap-2">
        <strong className="text-[32px] font-extrabold tracking-tight text-[#191f28]">
          {stock.price.toLocaleString()}
        </strong>
        <span className="text-base text-[#6b7684]">원</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-[15px] font-semibold ${change.className}`}>
          {changeSign}
          {Math.abs(stock.change).toLocaleString()}원 ({change.text})
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-[#f0f1f3] pt-4">
        <div className="grid gap-0.5">
          <dt className="text-xs text-[#8b95a1]">거래량</dt>
          <dd className="m-0 text-sm font-semibold text-[#191f28]">
            {stock.volume.toLocaleString()}주
          </dd>
        </div>
        <div className="grid gap-0.5">
          <dt className="text-xs text-[#8b95a1]">거래대금</dt>
          <dd className="m-0 text-sm font-semibold text-[#191f28]">
            {formatTradingValue(stock.tradingValue)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
