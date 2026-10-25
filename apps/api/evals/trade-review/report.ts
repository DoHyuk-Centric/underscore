import { appendFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type { TradeReview } from '@underscore/shared';
import { CRITERIA_VERSION, PASS_SCORE, type Judgement } from './criteria.js';
import type { GeminiCall } from './eval-gemini.js';
import type { TradeReviewScenario } from './scenarios.js';

/** 시나리오 한 번 실행한 결과. 저장해 두면 Gemini를 다시 부르지 않고 바뀐 기준으로 다시 채점할 수 있습니다. */
export interface EvalRun {
  scenario: TradeReviewScenario['id'];
  run: number;
  model: string | null;
  calls: Omit<GeminiCall, 'prompt'>[];
  elapsedMs: number;
  prompt: string | null;
  review: TradeReview | null;
  /** 답변을 받지 못한 이유. 한도 초과처럼 품질과 상관없는 실패는 unavailable로 표시합니다. */
  error: { message: string; unavailable: boolean } | null;
  judgement: Judgement | null;
}

export interface EvalResult {
  criteriaVersion: number;
  recordedAt: string;
  code: { commit: string; branch: string };
  runs: EvalRun[];
}

const RESULTS_DIR = fileURLToPath(new URL('./.results/', import.meta.url));

// ==================== 판정: 시나리오별로 회차를 모아 합격 여부 정하기 ====================

export type VerdictStatus = 'passed' | 'failed' | 'unavailable';

export interface ScenarioVerdict {
  scenario: TradeReviewScenario;
  runs: EvalRun[];
  /** 답을 받은 회차에서 어긴 필수 기준과, 생성 자체에 실패한 회차 */
  hardFailures: string[];
  /** 한도 초과처럼 품질과 상관없이 답을 받지 못한 회차 */
  unavailable: string[];
  /** 답을 받은 회차만의 점수 평균 */
  averageScore: number;
  status: VerdictStatus;
}

/**
 * 필수 기준은 답을 받은 모든 회차가 통과해야 하고, 점수 기준은 그 회차들의 평균으로 봅니다.
 * 답을 받지 못한 회차가 있으면 "판정 불가"입니다. 게이트는 막지만, 답변이 나빴다는 뜻은 아닙니다.
 */
export function decideVerdict(scenario: TradeReviewScenario, runs: EvalRun[]): ScenarioVerdict {
  const unavailable = runs.filter((run) => run.error?.unavailable).map((run) => `${run.run}회차: ${run.error!.message}`);
  const hardFailures = runs.flatMap((run) => {
    if (run.error) return run.error.unavailable ? [] : [`${run.run}회차: ${run.error.message}`];
    return (run.judgement?.failures ?? []).map((failure) => `${run.run}회차: ${failure}`);
  });
  const scores = runs.flatMap((run) => (run.judgement ? [run.judgement.score] : []));
  const averageScore = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

  const failed = hardFailures.length > 0 || (scores.length > 0 && averageScore < PASS_SCORE);
  const status: VerdictStatus = failed ? 'failed' : unavailable.length || !scores.length ? 'unavailable' : 'passed';
  return { scenario, runs, hardFailures, unavailable, averageScore, status };
}

// ==================== 저장: 결과 JSON과 요약을 남기기 ====================

export function readCodeVersion(): EvalResult['code'] {
  const git = (...args: string[]) => {
    try {
      return execFileSync('git', args, { encoding: 'utf8' }).trim();
    } catch {
      return 'unknown';
    }
  };
  return { commit: git('rev-parse', '--short', 'HEAD'), branch: process.env.GITHUB_HEAD_REF || git('rev-parse', '--abbrev-ref', 'HEAD') };
}

export function saveResult(result: EvalResult, verdicts: ScenarioVerdict[], label = 'eval'): string {
  mkdirSync(RESULTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = `${RESULTS_DIR}${stamp}-${label}`;
  const summary = summarize(result, verdicts);

  writeFileSync(`${base}.json`, `${JSON.stringify(result, null, 2)}\n`);
  writeFileSync(`${base}.md`, summary);
  // GitHub Actions에서는 작업 요약 화면에 그대로 보여줍니다.
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
  return `${base}.json`;
}

export function loadLatestResult(): EvalResult {
  const path = process.env.EVAL_RESULT_FILE ?? latestResultPath();
  return JSON.parse(readFileSync(path, 'utf8')) as EvalResult;
}

function latestResultPath(): string {
  const files = readdirSync(RESULTS_DIR).filter((name) => name.endsWith('-eval.json')).sort();
  if (!files.length) throw new Error('다시 채점할 결과가 없어요. pnpm --filter api eval을 먼저 실행해 주세요.');
  return `${RESULTS_DIR}${files.at(-1)}`;
}

function summarize(result: EvalResult, verdicts: ScenarioVerdict[]): string {
  const percent = (value: number) => `${Math.round(value * 100)}%`;
  const STATUS_LABEL = { passed: '✅ 합격', failed: '❌ 불합격', unavailable: '⚠️ 판정 불가' };
  const rows = verdicts.map(({ scenario, runs, hardFailures, averageScore, status }) => {
    const judged = runs.filter((run) => run.judgement).length;
    const models = [...new Set(runs.flatMap((run) => (run.model ? [run.model] : [])))].join(', ') || '-';
    const score = judged ? percent(averageScore) : '-';
    return `| ${STATUS_LABEL[status]} | ${scenario.label} | ${judged}/${runs.length} | ${hardFailures.length} | ${score} | ${models} |`;
  });
  const details = verdicts.flatMap(({ scenario, runs, hardFailures, unavailable }) => {
    const missed = [...new Set(runs.flatMap((run) => run.judgement?.missed ?? []))];
    if (!hardFailures.length && !unavailable.length && !missed.length) return [];
    return [
      `### ${scenario.label}`,
      ...hardFailures.map((failure) => `- 필수: ${failure}`),
      ...unavailable.map((reason) => `- 판정 불가: ${reason}`),
      ...(missed.length ? [`- 점수에서 놓친 항목: ${missed.join(' · ')}`] : []),
      '',
    ];
  });

  return [
    `## AI 답변 평가: 거래 복기 (기준 v${result.criteriaVersion})`,
    '',
    `코드 \`${result.code.branch}\` @ \`${result.code.commit}\` · 합격 기준: 필수 기준 전부 통과, 점수 평균 ${percent(PASS_SCORE)} 이상`,
    '',
    '| 판정 | 시나리오 | 답 받은 회차 | 필수 위반 | 점수 평균 | 모델 |',
    '| --- | --- | ---: | ---: | ---: | --- |',
    ...rows,
    '',
    ...details,
  ].join('\n');
}

export const newResult = (runs: EvalRun[]): EvalResult => ({
  criteriaVersion: CRITERIA_VERSION,
  recordedAt: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10),
  code: readCodeVersion(),
  runs,
});
