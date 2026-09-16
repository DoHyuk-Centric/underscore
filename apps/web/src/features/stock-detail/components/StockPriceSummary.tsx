import type { StockDetail } from "../mock/stock-detail-mock";
import { getChangeRatePresentation } from "../../../lib/change-rate-presentation";

type Props = { stock: StockDetail };

export function StockPriceSummary({ stock }: Props) {
  const changeRate = getChangeRatePresentation(stock.changeRate);
  const changeSign = stock.change > 0 ? "+" : stock.change < 0 ? "−" : "";
  return (
    <div className="stock-quote">
      <div className="stock-quote__identity">
        <div>
          <h1>{stock.name}</h1>
        </div>
        <span className="stock-quote__sector">{stock.sector}</span>
      </div>
      <p className="stock-quote__price">
        <strong>{stock.price.toLocaleString("ko-KR")}</strong><span>원</span>
      </p>
      <div className="stock-quote__change" data-sign={changeRate.sign}>
        <span className="stock-quote__comparison">전일보다</span>
        <span className="stock-quote__difference">{changeSign}{Math.abs(stock.change).toLocaleString("ko-KR")}원</span>
        <span className="stock-quote__badge">{changeRate.text}</span>
      </div>
    </div>
  );
}
