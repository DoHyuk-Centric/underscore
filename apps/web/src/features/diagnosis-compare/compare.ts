import type { DiagnosisSnapshot, SnapshotDiagnosis } from "./snapshots";

export type ComparableField =
  | "headline"
  | "companyIntro"
  | "impactContext"
  | "marketContext"
  | "caution"
  | "news";

export const COMPARABLE_FIELDS: { key: ComparableField; label: string }[] = [
  { key: "headline", label: "밑줄 (헤드라인)" },
  { key: "companyIntro", label: "회사 소개" },
  { key: "impactContext", label: "왜 주목할 만한 이슈인가요?" },
  { key: "marketContext", label: "어제의 시황" },
  { key: "caution", label: "주의" },
  { key: "news", label: "근거 링크" },
];

export type DiagnosisPair = {
  key: string;
  rank: number;
  left?: SnapshotDiagnosis;
  right?: SnapshotDiagnosis;
};

/**
 * 같은 기준일이면 같은 종목끼리, 기준일이 다르면(예: 목표 목업과 비교) 같은 순위끼리 짝짓습니다.
 * 순위로 짝지으면 서로 다른 종목이라 항목 차이는 의미가 없습니다.
 */
export type PairingMode = "stock" | "rank";

export const getPairingMode = (
  left: DiagnosisSnapshot,
  right: DiagnosisSnapshot,
): PairingMode => (left.baseDate === right.baseDate ? "stock" : "rank");

export const isDartLink = (url: string) => url.includes("dart.fss.or.kr");

// "공시는 확인되지 않았어요", "뚜렷한 개별 공시 없이"처럼 공시·뉴스 부재를 밝힌 헤드라인만 셉니다.
// "한 매체에서만 보도돼 다른 곳에서는 확인되지 않았어요"는 이유를 제시한 경우라 제외합니다.
const NO_EVIDENCE_PATTERN = /(공시|뉴스)[^.]*(확인되지 않았|없이|없는)/;

export const isUnconfirmed = (diagnosis: SnapshotDiagnosis) =>
  NO_EVIDENCE_PATTERN.test(diagnosis.headline);

const averageLength = (values: (string | null)[]) => {
  const texts = values.filter((value): value is string => Boolean(value));
  return texts.length
    ? Math.round(texts.reduce((sum, text) => sum + text.length, 0) / texts.length)
    : 0;
};

export const isSameField = (
  left: SnapshotDiagnosis | undefined,
  right: SnapshotDiagnosis | undefined,
  field: ComparableField,
) => JSON.stringify(left?.[field] ?? null) === JSON.stringify(right?.[field] ?? null);

export const countChangedFields = (pair: DiagnosisPair) =>
  COMPARABLE_FIELDS.filter(({ key }) => !isSameField(pair.left, pair.right, key))
    .length;

/** 두 버전의 진단을 짝지어 순위순으로 돌려줍니다. 한쪽에만 있는 종목·순위도 포함합니다. */
export const pairDiagnoses = (
  left: DiagnosisSnapshot,
  right: DiagnosisSnapshot,
): DiagnosisPair[] => {
  const keyOf = (diagnosis: SnapshotDiagnosis) =>
    getPairingMode(left, right) === "stock"
      ? diagnosis.stockCode
      : String(diagnosis.rank);
  const pairs = new Map<string, DiagnosisPair>();

  for (const diagnosis of left.diagnoses) {
    const key = keyOf(diagnosis);
    pairs.set(key, { key, rank: diagnosis.rank, left: diagnosis });
  }

  for (const diagnosis of right.diagnoses) {
    const key = keyOf(diagnosis);
    const pair = pairs.get(key);
    pairs.set(key, {
      key,
      rank: diagnosis.rank,
      left: pair?.left,
      right: diagnosis,
    });
  }

  return [...pairs.values()].sort((a, b) => a.rank - b.rank);
};

export type SnapshotMetrics = {
  total: number;
  unconfirmed: number;
  companyIntro: number;
  impactContext: number;
  disclosureBacked: number;
  averageLength: { headline: number; impactContext: number; caution: number };
  models: Record<string, number>;
};

export const summarizeSnapshot = ({ diagnoses }: DiagnosisSnapshot): SnapshotMetrics => ({
  total: diagnoses.length,
  unconfirmed: diagnoses.filter(isUnconfirmed).length,
  companyIntro: diagnoses.filter((d) => d.companyIntro).length,
  impactContext: diagnoses.filter((d) => d.impactContext).length,
  disclosureBacked: diagnoses.filter((d) => d.news.some((link) => isDartLink(link.url)))
    .length,
  averageLength: {
    headline: averageLength(diagnoses.map((d) => d.headline)),
    impactContext: averageLength(diagnoses.map((d) => d.impactContext)),
    caution: averageLength(diagnoses.map((d) => d.caution)),
  },
  models: diagnoses.reduce<Record<string, number>>((counts, d) => {
    counts[d.model] = (counts[d.model] ?? 0) + 1;
    return counts;
  }, {}),
});
