import { stockDiagnosisSchema } from "@underscore/shared";
import { z } from "zod";

const snapshotSchema = z.object({
  version: z.string().min(1),
  title: z.string().min(1),
  baseDate: z.string().min(1),
  recordedAt: z.string().min(1),
  storage: z.enum(["db", "dry-run", "manual"]),
  diagnoses: z.array(stockDiagnosisSchema.extend({ model: z.string().min(1) })),
});

export type DiagnosisSnapshot = z.infer<typeof snapshotSchema> & { id: string };
export type SnapshotDiagnosis = DiagnosisSnapshot["diagnoses"][number];

// 개선 로그(docs/AI-진단-개선-로그.md)와 함께 버전별 진단 결과를 보관하는 폴더입니다.
// 새 버전 파일을 추가하면 비교 페이지에 자동으로 나타납니다.
const files = import.meta.glob("../../../../../docs/ai-diagnosis-log/*.json", {
  eager: true,
  import: "default",
});

/** 목표치로 삼는 수동 작성 결과의 버전 이름입니다. */
export const TARGET_VERSION = "target";

// target은 0으로 취급해 목록 맨 앞에 둡니다.
const versionNumber = (version: string) => Number(version.replace(/\D/g, "")) || 0;

export const snapshots: DiagnosisSnapshot[] = Object.values(files)
  .map((data) => {
    const snapshot = snapshotSchema.parse(data);
    return { ...snapshot, id: `${snapshot.version}-${snapshot.baseDate}` };
  })
  .sort(
    (a, b) =>
      versionNumber(a.version) - versionNumber(b.version) ||
      a.baseDate.localeCompare(b.baseDate),
  );
