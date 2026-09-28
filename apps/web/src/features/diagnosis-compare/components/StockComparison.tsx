import { DiagnosisContent } from "../../stock-detail/components/AiDiagnosisCard";
import {
  COMPARABLE_FIELDS,
  countChangedFields,
  isDartLink,
  isSameField,
  type ComparableField,
  type DiagnosisPair,
  type PairingMode,
} from "../compare";
import type { DiagnosisSnapshot, SnapshotDiagnosis } from "../snapshots";

export type CompareView = "fields" | "cards";

type Props = {
  pair: DiagnosisPair;
  left: DiagnosisSnapshot;
  right: DiagnosisSnapshot;
  view: CompareView;
  pairingMode: PairingMode;
};

const stockLabel = (diagnosis?: SnapshotDiagnosis) =>
  diagnosis ? `${diagnosis.stockName} (${diagnosis.stockCode})` : "진단 없음";

const Empty = ({ children = "없음" }: { children?: string }) => (
  <p className="m-0 text-[13px] text-[#b0b8c1]">{children}</p>
);

const FieldValue = ({
  diagnosis,
  field,
}: {
  diagnosis?: SnapshotDiagnosis;
  field: ComparableField;
}) => {
  if (!diagnosis) return <Empty>진단 없음</Empty>;

  if (field === "news") {
    if (diagnosis.news.length === 0) return <Empty />;

    return (
      <ul className="m-0 grid list-none gap-1.5 p-0">
        {diagnosis.news.map((link) => {
          const dart = isDartLink(link.url);

          return (
            <li key={link.url} className="flex items-start gap-1.5 text-[13px] leading-relaxed">
              <span
                className={`mt-0.5 shrink-0 rounded px-1 text-[10px] font-bold ${
                  dart ? "bg-[#fff0e0] text-[#c2410c]" : "bg-[#f2f4f6] text-[#6b7684]"
                }`}
              >
                {dart ? "DART" : "뉴스"}
              </span>
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="min-w-0 wrap-break-word text-[#3182f6] underline-offset-2 hover:underline"
              >
                {link.title}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  if (field === "marketContext") {
    if (diagnosis.marketContext.length === 0) return <Empty />;

    return (
      <ul className="m-0 grid list-none gap-1 p-0">
        {diagnosis.marketContext.map((line) => (
          <li key={line} className="text-[13px] leading-relaxed text-[#4e5968]">
            · {line}
          </li>
        ))}
      </ul>
    );
  }

  const value = diagnosis[field];
  if (!value) return <Empty />;

  return (
    <p className="m-0 wrap-break-word text-[13px] leading-relaxed text-[#191f28]">{value}</p>
  );
};

const ColumnHeader = ({
  snapshot,
  diagnosis,
  showStock,
}: {
  snapshot: DiagnosisSnapshot;
  diagnosis?: SnapshotDiagnosis;
  showStock: boolean;
}) => (
  <div className="min-w-0 text-xs font-semibold text-[#8b95a1]">
    <span className="text-[#191f28]">{snapshot.version}</span>
    {diagnosis ? ` · ${diagnosis.model}` : ""}
    {showStock ? (
      <span className="mt-0.5 block text-[13px] font-bold text-[#191f28]">
        {stockLabel(diagnosis)}
      </span>
    ) : null}
  </div>
);

export const StockComparison = ({ pair, left, right, view, pairingMode }: Props) => {
  const byStock = pairingMode === "stock";
  const changed = countChangedFields(pair);
  const stock = pair.right ?? pair.left;

  return (
    <section id={`pair-${pair.key}`} className="scroll-mt-32 rounded-2xl bg-white p-4">
      <header className="flex flex-wrap items-center gap-2">
        <h2 className="m-0 text-[15px] font-bold text-[#191f28]">
          {byStock ? `${pair.rank}. ${stock?.stockName}` : `${pair.rank}위`}
        </h2>
        {byStock ? <span className="text-xs text-[#8b95a1]">{stock?.stockCode}</span> : null}
        {/* 순위로 짝지으면 서로 다른 종목이라 항목 차이를 세지 않습니다. */}
        {byStock ? (
          <span
            className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              changed > 0 ? "bg-[#eaf2fe] text-[#3182f6]" : "bg-[#f2f4f6] text-[#8b95a1]"
            }`}
          >
            {changed > 0 ? `${changed}개 항목 달라짐` : "변화 없음"}
          </span>
        ) : null}
      </header>

      <div className="mt-3 grid grid-cols-2 gap-3 border-b border-[#f2f4f6] pb-2">
        <ColumnHeader snapshot={left} diagnosis={pair.left} showStock={!byStock} />
        <ColumnHeader snapshot={right} diagnosis={pair.right} showStock={!byStock} />
      </div>

      {view === "cards" ? (
        <div className="grid grid-cols-2 gap-3">
          {[pair.left, pair.right].map((diagnosis, index) => (
            <div key={index} className="min-w-0">
              {diagnosis ? <DiagnosisContent diagnosis={diagnosis} /> : <Empty>진단 없음</Empty>}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid">
          {COMPARABLE_FIELDS.map(({ key, label }) => {
            const same = !byStock || isSameField(pair.left, pair.right, key);

            return (
              <div key={key} className="border-b border-[#f2f4f6] py-3 last:border-b-0">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#6b7684]">{label}</span>
                  {same ? null : (
                    <span className="rounded bg-[#eaf2fe] px-1 text-[10px] font-bold text-[#3182f6]">
                      달라짐
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="min-w-0 border-l-2 border-[#e5e8eb] pl-2">
                    <FieldValue diagnosis={pair.left} field={key} />
                  </div>
                  <div
                    className={`min-w-0 border-l-2 pl-2 ${
                      same ? "border-[#e5e8eb]" : "border-[#3182f6]"
                    }`}
                  >
                    <FieldValue diagnosis={pair.right} field={key} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
