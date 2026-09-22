import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  name?: string;
  market?: string;
  stockCode: string;
};

export function StockDetailHeader({ name, market, stockCode }: Props) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#f0f1f3] bg-white px-3 py-1">
      <button
        type="button"
        aria-label="뒤로 가기"
        onClick={() => navigate(-1)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#191f28] active:bg-[#f2f4f6]"
      >
        <ArrowLeft size={22} />
      </button>
      <div className="min-w-0">
        <strong className="block truncate text-[17px] font-bold text-[#191f28]">
          {name ?? "종목 상세"}
        </strong>
        {market ? (
          <span className="block text-xs text-[#8b95a1]">
            {market} · {stockCode}
          </span>
        ) : null}
      </div>
    </header>
  );
}
