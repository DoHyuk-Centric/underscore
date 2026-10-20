import type { TradeReview, TradeReviewRequest } from '@underscore/shared';
import { changePercent, comparePrices } from '../../src/trade-review/trade-review.comparisons.js';
import { findForbiddenPhrase, findStrategyPhrase } from '../../src/trade-review/trade-review.schema.js';
import type { Expectation } from './scenarios.js';

/**
 * 판정 기준 버전. 기준을 바꾸면 올리고, 저장해 둔 이전 결과를 `pnpm --filter api eval:rescore`로 다시 채점해
 * 같은 기준에서 비교합니다.
 *
 * v1 (2026-10-20): 필수 기준 9개(생성 성공 + 아래 8개), 점수 기준은 시나리오별 기대 항목의 평균 80% 이상
 */
export const CRITERIA_VERSION = 1;
export const PASS_SCORE = 0.8;

export interface JudgeInput {
  request: TradeReviewRequest;
  review: TradeReview;
  /** 서비스가 Gemini에 보낸 입력. 답변의 숫자·인용이 입력에 있었는지 대조합니다. */
  prompt: string;
  hasDisclosures: boolean;
}

export interface Judgement {
  /** 어긴 필수 기준. 비어 있어야 합격입니다. */
  failures: string[];
  score: number;
  missed: string[];
}

export function judge(input: JudgeInput, expectations: Expectation[]): Judgement {
  const text = collectTexts(input.review);
  const failures = [
    ...checkSignedOutcome(input),
    ...checkNumbersAreGrounded(text, input.prompt),
    ...checkQuotesAreVerbatim(text, input.prompt),
    ...checkComparisonBases(text, input),
    ...checkMissingReasonsNotGuessed(text, input.request),
    ...checkNoDisclosureStated(text, input.hasDisclosures),
    ...checkNewsNotConfirmedFact(input.review),
    ...checkNoForbiddenPhrase(input.review),
  ];
  const missed = expectations.filter(({ pattern }) => !pattern.test(text)).map(({ label }) => label);

  return { failures, score: expectations.length ? 1 - missed.length / expectations.length : 1, missed };
}

// ==================== 준비: 답변 글을 한데 모으고 숫자를 정규화하기 ====================

function collectTexts(review: TradeReview): string {
  return [
    review.summary,
    review.thesisVsOutcome,
    ...review.confirmedFacts.map((fact) => fact.text),
    ...review.possibleFactors.flatMap((factor) => [factor.factor, factor.reason]),
    ...review.userJudgmentItems.flatMap((item) => [item.topic, ...item.knownFacts, item.whyUserJudgment]),
    ...review.glossary.map((entry) => entry.definition),
  ].join('\n');
}

/** "1,880,000" → "1880000", "107.40" → "107.4" */
const normalizeNumber = (value: string) => {
  const plain = value.replaceAll(',', '');
  return plain.includes('.') ? plain.replace(/\.?0+$/, '') : plain;
};

const NUMBER_PATTERN = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g;

const sign = (value: number) => (value > 0 ? '+' : '');

// ==================== 필수 기준: 하나라도 어기면 불합격 ====================

/** 1. 요약에 부호가 붙은 실현 수익률과 실현 손익을 입력과 같은 표기로 씀 */
function checkSignedOutcome({ review }: JudgeInput): string[] {
  const { returnPercent, realizedProfit } = review.metrics;
  const expected = [`${sign(returnPercent)}${returnPercent}%`, `${sign(realizedProfit)}${realizedProfit.toLocaleString('ko-KR')}원`];
  return expected.filter((value) => !review.summary.includes(value)).map((value) => `요약에 "${value}"가 없어요`);
}

/** 2. 답변의 금액·비율이 모두 입력에 있던 숫자 (모델이 계산하거나 지어낸 숫자가 없음) */
function checkNumbersAreGrounded(text: string, prompt: string): string[] {
  const inputNumbers = new Set([...prompt.matchAll(NUMBER_PATTERN)].map(([value]) => normalizeNumber(value)));
  const ungrounded = [...text.matchAll(/(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)\s*(%p|%|원|억|조)/g)]
    .filter(([, value]) => !inputNumbers.has(normalizeNumber(value)))
    .map(([token]) => token);
  return [...new Set(ungrounded)].map((token) => `입력에 없는 숫자 "${token}"`);
}

/** 3. 큰따옴표로 인용한 10자 이상 문장이 입력(사용자 근거·공시·기사)에 그대로 있음 */
function checkQuotesAreVerbatim(text: string, prompt: string): string[] {
  const squash = (value: string) => value.replace(/\s+/g, ' ').trim().replace(/[.。]$/, '');
  const source = squash(prompt);
  return [...text.matchAll(/"([^"\n]{10,})"|“([^”\n]{10,})”/g)]
    .map(([, straight, curly]) => squash(straight ?? curly))
    .filter((quote) => !source.includes(quote))
    .map((quote) => `원문과 다른 인용 "${quote}"`);
}

/**
 * 4. "첫 매수가 대비", "평균 매수가 대비" 뒤에 쓴 %가 그 기준으로 계산한 값과 같음
 * (v3에서 첫 매수가 기준 +48.99%를 "평균 매수가 대비"로 옮긴 오류를 잡습니다)
 * 서버가 넘긴 값만이 아니라 그 기준으로 계산하면 맞는 값(예: 첫 매수가 대비 매도 가격)도 통과입니다.
 */
function checkComparisonBases(text: string, { request, review }: JudgeInput): string[] {
  const { sellsVsAverageBuy } = comparePrices(request, review.metrics, new Map(), []);
  const [firstBuy] = [...request.buys].sort((a, b) => a.date.localeCompare(b.date));
  const laterEntries = [...request.buys, ...request.sells].filter((entry) => entry !== firstBuy);
  const allowed = {
    첫: new Set(laterEntries.map((entry) => Math.abs(changePercent(firstBuy.price, entry.price)))),
    평균: new Set([...sellsVsAverageBuy.map((entry) => Math.abs(entry.changePercent)), Math.abs(review.metrics.returnPercent)]),
  };
  const pattern = /(첫|평균)\s*매수\s*(?:가격|가)\s*(?:[\d,]+원\s*)?(?:대비|보다)[^.%\n]{0,30}?(\d+(?:\.\d+)?)%/g;

  return [...text.matchAll(pattern)]
    .filter(([, base, value]) => !allowed[base as '첫' | '평균'].has(Number(value)))
    .map(([phrase]) => `비교 기준과 값이 맞지 않아요 "${phrase}"`);
}

/**
 * 5. 근거를 남기지 않은 거래가 있으면 이유를 추정하지 않았다고 밝힘
 * "추정하지 않았어요" 외에 "그때의 생각이 기록에 남아 있지 않아요"처럼 같은 뜻의 표현도 인정합니다.
 */
const NOT_GUESSED_PATTERN = /추정하지|추정 없이|(생각|근거|이유)[^.\n]{0,15}(기록에 남아 있지 않|기록에 없|남기지 않|적혀 있지 않)/;

function checkMissingReasonsNotGuessed(text: string, request: TradeReviewRequest): string[] {
  const hasMissingReason = [...request.buys, ...request.sells].some((entry) => !entry.reason.trim());
  return hasMissingReason && !NOT_GUESSED_PATTERN.test(text) ? ['근거 없는 거래의 이유를 추정하지 않았다는 말이 없어요'] : [];
}

/** 6. 보유 기간 공시가 없으면 없다고 밝힘 */
function checkNoDisclosureStated(text: string, hasDisclosures: boolean): string[] {
  return !hasDisclosures && !/공시[^.\n]{0,15}(없|확인되지 않)/.test(text) ? ['공시가 없다는 말이 없어요'] : [];
}

/** 7. 기사(기자의 해석)를 "확인된 사실"의 출처로 쓰지 않음 */
function checkNewsNotConfirmedFact(review: TradeReview): string[] {
  return review.confirmedFacts
    .filter((fact) => fact.sourceIds.some((id) => id.startsWith('news:')))
    .map((fact) => `기사를 확인된 사실의 출처로 씀 "${fact.text.slice(0, 40)}…"`);
}

/** 8. 매매 권유·예측·전략 표현이 없음 (서비스의 금지·전략 표현 검사와 같은 기준) */
function checkNoForbiddenPhrase(review: TradeReview): string[] {
  const phrase = findForbiddenPhrase(review) ?? findStrategyPhrase(review);
  return phrase ? [`금지 표현 "${phrase}"`] : [];
}
