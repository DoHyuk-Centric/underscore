import { summarizeSnapshot, type SnapshotMetrics } from "../compare";
import type { DiagnosisSnapshot } from "../snapshots";

type Props = {
  left: DiagnosisSnapshot;
  right: DiagnosisSnapshot;
};

const ROWS: { label: string; value: (metrics: SnapshotMetrics) => string }[] = [
  { label: "진단 수", value: (m) => `${m.total}` },
  { label: "공시·뉴스 부재 명시", value: (m) => `${m.unconfirmed}` },
  { label: "회사 소개 채움", value: (m) => `${m.companyIntro}/${m.total}` },
  { label: "이슈 규모 설명 채움", value: (m) => `${m.impactContext}/${m.total}` },
  { label: "DART 공시 근거", value: (m) => `${m.disclosureBacked}` },
  {
    label: "평균 글자 수 (헤드라인 / 이슈 규모 / 주의)",
    value: ({ averageLength: a }) => `${a.headline} / ${a.impactContext || "-"} / ${a.caution}`,
  },
  {
    label: "모델",
    value: (m) =>
      Object.entries(m.models)
        .map(([model, count]) => `${model} ${count}`)
        .join(", "),
  },
];

const STORAGE_LABELS: Record<DiagnosisSnapshot["storage"], string> = {
  db: "DB 저장",
  "dry-run": "드라이런",
  manual: "수동 작성",
};

const storageLabel = (snapshot: DiagnosisSnapshot) => STORAGE_LABELS[snapshot.storage];

export const SnapshotSummary = ({ left, right }: Props) => {
  const leftMetrics = summarizeSnapshot(left);
  const rightMetrics = summarizeSnapshot(right);

  return (
    <section className="overflow-x-auto rounded-2xl bg-white p-4">
      <h2 className="m-0 text-[15px] font-bold text-[#191f28]">요약</h2>
      <table className="mt-3 w-full border-collapse text-[13px]">
        <thead>
          <tr className="text-left text-[#8b95a1]">
            <th className="w-40 py-2 pr-3 font-semibold">지표</th>
            {[left, right].map((snapshot) => (
              <th key={snapshot.id} className="py-2 pr-3 font-semibold">
                <span className="text-[#191f28]">{snapshot.version}</span> · {snapshot.title}
                <span className="block text-[11px] font-medium">
                  기준일 {snapshot.baseDate} · 기록 {snapshot.recordedAt} ·{" "}
                  {storageLabel(snapshot)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(({ label, value }) => (
            <tr key={label} className="border-t border-[#f2f4f6] text-[#4e5968]">
              <td className="py-2 pr-3 text-[#8b95a1]">{label}</td>
              <td className="py-2 pr-3">{value(leftMetrics)}</td>
              <td className="py-2 pr-3 font-semibold text-[#191f28]">
                {value(rightMetrics)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
