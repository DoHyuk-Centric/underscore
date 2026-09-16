import type { CSSProperties } from "react";
import type { StockDetail } from "../mock/stock-detail-mock";

type Props = { stock: StockDetail };

function formatAmount(value: number): string {
  const eok = Math.round(value / 100_000_000);
  if (eok < 1) return `${value.toLocaleString("ko-KR")}원`;
  const jo = Math.floor(eok / 10_000);
  const remainder = eok % 10_000;
  return jo ? `${jo.toLocaleString("ko-KR")}조${remainder ? ` ${remainder.toLocaleString("ko-KR")}억` : ""}원` : `${eok.toLocaleString("ko-KR")}억원`;
}

export function StockInfoGrid({ stock }: Props) {
  const range = stock.high52w - stock.low52w;
  const position = range > 0 ? Math.min(100, Math.max(0, ((stock.price - stock.low52w) / range) * 100)) : 50;
  const priceRows = [
    { label: "시가", value: stock.open },
    { label: "전일 종가", value: stock.prevClose },
    { label: "고가", value: stock.high, sign: "plus" },
    { label: "저가", value: stock.low, sign: "minus" },
  ];
  return (
    <section className="stock-info" aria-labelledby="stock-info-title">
      <h2 id="stock-info-title">종목 정보</h2>
      <div className="stock-info__section">
        <h3>오늘의 가격</h3>
        <dl className="stock-info__prices">
          {priceRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd data-sign={row.sign}>{row.value.toLocaleString("ko-KR")}<span>원</span></dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="stock-info__section">
        <div className="stock-info__range-heading"><h3>52주 가격 범위</h3><span>현재가 위치</span></div>
        <div className="stock-info__range" role="img"
          aria-label={`52주 최저 ${stock.low52w.toLocaleString("ko-KR")}원, 최고 ${stock.high52w.toLocaleString("ko-KR")}원. 현재 ${stock.price.toLocaleString("ko-KR")}원.`}
          style={{ "--price-position": `${position}%` } as CSSProperties}><span /></div>
        <dl className="stock-info__range-values">
          <div><dt>최저</dt><dd>{stock.low52w.toLocaleString("ko-KR")}원</dd></div>
          <div><dt>최고</dt><dd>{stock.high52w.toLocaleString("ko-KR")}원</dd></div>
        </dl>
      </div>
      <div className="stock-info__section">
        <h3>거래 정보</h3>
        <dl className="stock-info__rows">
          <div><dt>거래량</dt><dd>{stock.volume.toLocaleString("ko-KR")}주</dd></div>
          <div><dt>거래대금</dt><dd>{formatAmount(stock.tradingValue)}</dd></div>
        </dl>
      </div>
      <div className="stock-info__section">
        <h3>기업 규모</h3>
        <dl className="stock-info__rows">
          <div><dt>시가총액</dt><dd>{formatAmount(stock.marketCap)}</dd></div>
          <div><dt>상장주식수</dt><dd>{stock.sharesOutstanding.toLocaleString("ko-KR")}주</dd></div>
        </dl>
      </div>
    </section>
  );
}
