// 거래 복기 AI 답변 게이트. 고정 입력으로 시나리오마다 여러 번 답변을 받아, 기준에 못 미치면 실패합니다.
// usage: pnpm --filter api eval   (회차 수: EVAL_RUNS, 기본 3)
import { judge, PASS_SCORE } from './criteria.js';
import { createEvalGemini, geminiQuota, type GeminiCall } from './eval-gemini.js';
import { createFixtureClients, createReviewService, loadFixture } from './fixture-clients.js';
import { decideVerdict, newResult, saveResult, type EvalRun, type ScenarioVerdict } from './report.js';
import { SCENARIOS, type TradeReviewScenario } from './scenarios.js';

const RUNS = Number(process.env.EVAL_RUNS ?? 3);

const allRuns: EvalRun[] = [];
const verdicts: ScenarioVerdict[] = [];

describe.runIf(import.meta.env.MODE === 'test')('AI 답변 평가: 거래 복기', () => {
  afterAll(() => {
    if (allRuns.length) console.log(`결과 저장: ${saveResult(newResult(allRuns), verdicts)}`);
  });

  describe.each(SCENARIOS)('$label', (scenario) => {
    let verdict: ScenarioVerdict;

    beforeAll(async () => {
      const runs = await runRepeatedly(scenario);
      allRuns.push(...runs);
      verdict = decideVerdict(scenario, runs);
      verdicts.push(verdict);
    });

    // 한도 초과로 답을 못 받으면 품질을 판정할 수 없어 게이트를 통과시키지 않습니다.
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

// ==================== 실행: 고정 입력으로 시나리오를 여러 번 돌리기 ====================

async function runRepeatedly(scenario: TradeReviewScenario): Promise<EvalRun[]> {
  const runs: EvalRun[] = [];
  for (let run = 1; run <= RUNS; run++) {
    // 하루 한도에 걸린 뒤에는 불러도 실패하므로, 남은 회차는 호출 없이 판정 불가로 둡니다.
    runs.push(geminiQuota.exhaustedReason ? skippedRun(scenario, run, geminiQuota.exhaustedReason) : await runOnce(scenario, run));
  }
  return runs;
}

async function runOnce(scenario: TradeReviewScenario, run: number): Promise<EvalRun> {
  const fixture = loadFixture(scenario);
  const { gemini, calls } = createEvalGemini();
  const service = createReviewService(createFixtureClients(fixture), gemini);
  const startedAt = Date.now();

  try {
    const review = await service.review(scenario.request);
    const prompt = calls.filter((call) => call.ok).at(-1)!.prompt!;
    const judgement = judge(
      { request: scenario.request, review, prompt, hasDisclosures: fixture.disclosures.length > 0 },
      scenario.expectations,
    );
    return { scenario: scenario.id, run, ...describeCalls(calls), elapsedMs: Date.now() - startedAt, prompt, review, error: null, judgement };
  } catch (error) {
    // 서비스는 Gemini 실패를 "AI 분석을 만들지 못했어요"로 감싸서, 한도 초과였는지는 호출 기록으로 판단합니다.
    const unavailable = Boolean(geminiQuota.exhaustedReason) || calls.some((call) => call.status === 429);
    const message = unavailable
      ? (geminiQuota.exhaustedReason ?? 'Gemini 한도 초과(429)라 답변을 받지 못했어요')
      : `생성 실패: ${(error as Error).message}`;
    return {
      scenario: scenario.id,
      run,
      ...describeCalls(calls),
      elapsedMs: Date.now() - startedAt,
      prompt: null,
      review: null,
      error: { message, unavailable },
      judgement: null,
    };
  }
}

function skippedRun(scenario: TradeReviewScenario, run: number, reason: string): EvalRun {
  return {
    scenario: scenario.id,
    run,
    model: null,
    calls: [],
    elapsedMs: 0,
    prompt: null,
    review: null,
    error: { message: `${reason} (호출하지 않음)`, unavailable: true },
    judgement: null,
  };
}

function describeCalls(calls: GeminiCall[]) {
  return {
    model: calls.filter((call) => call.ok).at(-1)?.model ?? null,
    calls: calls.map(({ prompt: _prompt, ...call }) => call),
  };
}
