import { AlertTriangle, Building2, ExternalLink, LineChart, Sparkles } from "lucide-react";
import type { PopularStock } from "@underscore/shared";
import { usePopularSectors } from "../../popular-sector/hooks/usePopularSectors";
import { getDiagnosis } from "../mock/ai-diagnosis-mock";

type Props = {
  stock: PopularStock;
};

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Building2;
  children: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[#8b95a1]">
      <Icon size={13} aria-hidden="true" />
      <span className="text-xs font-semibold">{children}</span>
    </div>
  );
}

export function AiDiagnosisCard({ stock }: Props) {
  const { stocks: topSurgingStocks, isLoading } = usePopularSectors();
  const isEligible = topSurgingStocks.some(
    (surging) => surging.stockCode === stock.stockCode,
  );

  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="flex items-center gap-1.5">
        <Sparkles size={16} className="text-[#3182f6]" aria-hidden="true" />
        <h2 className="m-0 text-[15px] font-bold text-[#191f28]">AI 진단</h2>
      </div>

      {isLoading ? (
        <p className="m-0 mt-3 text-sm text-[#8b95a1]">확인하는 중이에요...</p>
      ) : !isEligible ? (
        <p className="m-0 mt-3 text-sm leading-relaxed text-[#8b95a1]">
          AI 진단은 오늘 급등 상위 10개 종목에만 제공돼요.
        </p>
      ) : (
        <DiagnosisContent stock={stock} />
      )}
    </section>
  );
}

function DiagnosisContent({ stock }: Props) {
  const diagnosis = getDiagnosis(stock);

  return (
    <div className="mt-3 grid gap-4">
      <div className="rounded-xl bg-[#eaf2fe] p-3">
        <span className="text-xs font-bold text-[#3182f6]">밑줄</span>
        <p className="m-0 mt-1 text-[13px] font-medium leading-relaxed text-[#191f28]">
          {diagnosis.headline}
        </p>
      </div>

      {diagnosis.companyIntro ? (
        <div className="grid gap-1.5">
          <SectionLabel icon={Building2}>회사 소개</SectionLabel>
          <p className="m-0 text-[13px] leading-relaxed text-[#4e5968]">
            {diagnosis.companyIntro}
          </p>
        </div>
      ) : null}

      {diagnosis.impactContext ? (
        <div className="grid gap-1.5 rounded-xl bg-[#f7f8fa] p-3">
          <span className="text-xs font-bold text-[#191f28]">
            왜 주목할 만한 이슈인가요?
          </span>
          <p className="m-0 text-[13px] leading-relaxed text-[#4e5968]">
            {diagnosis.impactContext}
          </p>
        </div>
      ) : null}

      {diagnosis.marketContext && diagnosis.marketContext.length > 0 ? (
        <div className="grid gap-1.5">
          <SectionLabel icon={LineChart}>어제의 시황</SectionLabel>
          <ul className="m-0 grid list-none gap-1 p-0">
            {diagnosis.marketContext.map((line) => (
              <li key={line} className="text-[13px] leading-relaxed text-[#4e5968]">
                · {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {diagnosis.news && diagnosis.news.length > 0 ? (
        <div className="grid gap-1.5">
          <SectionLabel icon={ExternalLink}>관련 뉴스</SectionLabel>
          <ul className="m-0 grid list-none gap-2 p-0">
            {diagnosis.news.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-1.5 text-[13px] leading-relaxed text-[#3182f6] underline-offset-2 hover:underline"
                >
                  <ExternalLink size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex items-start gap-1.5 rounded-xl bg-[#fff8e6] p-3">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#b45309]" aria-hidden="true" />
        <p className="m-0 text-[13px] leading-relaxed text-[#8a5a1f]">{diagnosis.caution}</p>
      </div>

      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#f2f4f6] px-2 py-1 text-[11px] font-semibold text-[#6b7684]">
        예시 데이터
      </span>
    </div>
  );
}
