function Bar({ width, height = 14 }: { width: number | string; height?: number }) {
  return <span className="stock-detail__skeleton-bar" style={{ width, height }} />;
}

export function StockDetailSkeleton() {
  return (
    <div className="stock-detail__content" role="status" aria-label="종목 정보를 불러오는 중">
      <div className="stock-detail__overview stock-detail__skeleton" aria-hidden="true">
        <Bar width={140} height={28} /><Bar width={100} />
        <Bar width={220} height={46} /><Bar width={180} height={24} />
        <Bar width="100%" height={280} /><Bar width="100%" height={44} />
      </div>
      <div className="stock-info stock-detail__skeleton" aria-hidden="true">
        <Bar width={96} height={24} />
        {Array.from({ length: 4 }, (_, index) => <Bar key={index} width="100%" height={96} />)}
      </div>
    </div>
  );
}
