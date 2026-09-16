import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

type Props = { name?: string; market?: string; stockCode: string };

export function StockDetailHeader({ name, market, stockCode }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <header className="stock-detail__header">
      <div className="stock-detail__header-inner">
        <button type="button" aria-label="뒤로 가기" className="stock-detail__back"
          onClick={() => location.key === "default" ? navigate("/home", { replace: true }) : navigate(-1)}>
          <ArrowLeft size={22} aria-hidden="true" />
        </button>
        <span className="stock-detail__header-title">종목 상세</span>
        <span className="stock-detail__header-code" title={name}>
          {market && <span>{market}</span>}{stockCode}
        </span>
      </div>
    </header>
  );
}
