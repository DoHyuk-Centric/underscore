// 저장해 둔 결과를 현재 기준으로 다시 채점합니다. Gemini를 부르지 않으니 기준을 바꾼 뒤 이전 결과와 같은 기준으로 비교할 때 씁니다.
// usage: pnpm --filter api eval:rescore   (기본: 가장 최근 결과, 다른 파일은 EVAL_RESULT_FILE로 지정)
import { readFileSync } from 'node:fs';
import { CRITERIA_VERSION, judge, PASS_SCORE } from './criteria.js';
import { decideVerdict, loadLatestResult, newResult, saveResult, type EvalResult, type EvalRun, type ScenarioVerdict } from './report.js';
import { SCENARIOS } from './scenarios.js';

const isRescore = import.meta.env.MODE === 'rescore';

describe.runIf(isRescore)(`다시 채점: 거래 복기 (기준 v${CRITERIA_VERSION})`, () => {
  // 다른 모드에서도 테스트 목록을 모으느라 이 블록이 실행되므로, 결과 파일은 다시 채점할 때만 읽습니다.
  if (!isRescore) return;

  const result = loadResult();
  const runs = result.runs.map(rejudge);
  const verdicts: ScenarioVerdict[] = SCENARIOS.filter((scenario) => runs.some((run) => run.scenario === scenario.id)).map(
    (scenario) => decideVerdict(scenario, runs.filter((run) => run.scenario === scenario.id)),
  );

  afterAll(() => {
    console.log(`다시 채점 결과 저장: ${saveResult({ ...newResult(runs), code: result.code }, verdicts, 'rescore')}`);
  });

  describe.each(verdicts)('$scenario.label', (verdict) => {
    it('모든 회차의 답변을 받았다', () => {
      expect(verdict.unavailable).toEqual([]);
    });

    it('필수 기준을 모든 회차가 통과한다', () => {
      expect(verdict.hardFailures).toEqual([]);
    });

    it(`점수 기준 평균 ${PASS_SCORE * 100}% 이상`, () => {
      expect(verdict.averageScore).toBeGreaterThanOrEqual(PASS_SCORE);
    });
  });
});

// ==================== 준비: 저장된 결과 읽기 ====================

/** 평가 결과 파일, 또는 게이트 이전의 드라이런 결과 파일({ reviews: [...] })을 읽습니다. */
function loadResult(): EvalResult {
  const file = process.env.EVAL_RESULT_FILE;
  if (!file) return loadLatestResult();

  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (data.runs) return data as EvalResult;

  const legacy = data as { code?: EvalResult['code']; reviews: (Pick<EvalRun, 'model' | 'prompt' | 'review'> & { scenario: EvalRun['scenario'] })[] };
  return {
    criteriaVersion: 0,
    recordedAt: data.recordedAt,
    code: legacy.code ?? { commit: 'unknown', branch: 'unknown' },
    runs: legacy.reviews.map((item) => ({ ...item, run: 1, calls: [], elapsedMs: 0, error: item.review ? null : { message: '생성 실패', unavailable: false }, judgement: null })),
  };
}

// ==================== 채점: 현재 기준으로 다시 판정 ====================

function rejudge(run: EvalRun): EvalRun {
  const scenario = SCENARIOS.find((candidate) => candidate.id === run.scenario);
  if (!scenario || !run.review || !run.prompt) return run;

  return {
    ...run,
    judgement: judge(
      { request: scenario.request, review: run.review, prompt: run.prompt, hasDisclosures: promptHasDisclosures(run.prompt) },
      scenario.expectations,
    ),
  };
}

/** 프롬프트 입력의 "공시" 배열이 비어 있지 않으면 공시가 있던 시나리오입니다. */
function promptHasDisclosures(prompt: string): boolean {
  const input = JSON.parse(prompt.slice(prompt.indexOf('{'))) as { 공시?: unknown[] };
  return (input.공시?.length ?? 0) > 0;
}
