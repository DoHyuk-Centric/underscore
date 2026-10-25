import { evidenceStrengthSchema } from '@underscore/shared';
import { z } from 'zod';

/** AI가 돌려주는 부분. 수치(metrics)와 출처 목록(sources)은 서버가 만들어 붙입니다. */
export const reviewOutputSchema = z.object({
  summary: z.string().min(1).max(400),
  thesisVsOutcome: z.string().min(1).max(800),
  confirmedFacts: z
    .array(z.object({ text: z.string().min(1).max(300), sourceIds: z.array(z.string()) }))
    .max(6),
  possibleFactors: z
    .array(
      z.object({
        factor: z.string().min(1).max(200),
        reason: z.string().min(1).max(400),
        sourceIds: z.array(z.string()),
        evidenceStrength: evidenceStrengthSchema,
      }),
    )
    .max(4),
  userJudgmentItems: z
    .array(
      z.object({
        topic: z.string().min(1).max(200),
        knownFacts: z.array(z.string().min(1).max(300)).max(4),
        whyUserJudgment: z.string().min(1).max(400),
      }),
    )
    .max(3),
  glossary: z
    .array(z.object({ term: z.string().min(1).max(40), definition: z.string().min(1).max(200) }))
    .max(5),
});

export type ReviewOutput = z.infer<typeof reviewOutputSchema>;

const SOURCE_IDS = { type: 'ARRAY', items: { type: 'STRING' } };

/** Gemini 구조화 출력(responseSchema)에 전달하는 스키마입니다. */
export const GEMINI_REVIEW_SCHEMA = {
  type: 'OBJECT',
  properties: {
    summary: { type: 'STRING' },
    thesisVsOutcome: { type: 'STRING' },
    confirmedFacts: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { text: { type: 'STRING' }, sourceIds: SOURCE_IDS },
        required: ['text', 'sourceIds'],
      },
    },
    possibleFactors: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          factor: { type: 'STRING' },
          reason: { type: 'STRING' },
          sourceIds: SOURCE_IDS,
          evidenceStrength: { type: 'STRING', enum: evidenceStrengthSchema.options },
        },
        required: ['factor', 'reason', 'sourceIds', 'evidenceStrength'],
      },
    },
    userJudgmentItems: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING' },
          knownFacts: { type: 'ARRAY', items: { type: 'STRING' } },
          whyUserJudgment: { type: 'STRING' },
        },
        required: ['topic', 'knownFacts', 'whyUserJudgment'],
      },
    },
    glossary: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { term: { type: 'STRING' }, definition: { type: 'STRING' } },
        required: ['term', 'definition'],
      },
    },
  },
  required: ['summary', 'thesisVsOutcome', 'confirmedFacts', 'possibleFactors', 'userJudgmentItems', 'glossary'],
};

// 매수·매도·보유 권유, 목표가·손절가, 미래 가격 예측 표현을 걸러냅니다. "매수 근거" 같은 서술은 허용합니다.
const FORBIDDEN_PATTERNS = [
  /(매수|매도|보유|추가\s*매수|분할\s*매수)\s*(를|은|는)?\s*(하세요|해\s*보세요|추천|권유|고려해\s*보세요)/,
  /(사세요|파세요|담으세요|팔아야|사야\s*(해요|합니다)|들고\s*가세요)/,
  /목표\s*주?가/,
  /손절\s*(가|선|라인)/,
  /(오를|내릴|상승할|하락할)\s*(거예요|것입니다|전망)/,
];

// 매매 전략 용어입니다. 권유는 아니어도 복기를 전략 이야기로 끌고 가서 피합니다.
// 사용자가 근거에 직접 쓴 말일 수 있어 따옴표로 인용한 부분은 빼고 검사합니다.
const STRATEGY_PATTERNS = [/손절/, /비중\s*(계획|확대|축소|조절|을\s*늘|을\s*줄)/, /대응\s*기준/, /매매\s*규칙/];

const withoutQuotes = (text: string) => text.replace(/"[^"]*"|“[^”]*”|'[^']*'|‘[^’]*’/g, '');

// 전략 표현이 든 문장을 지운 뒤 판단 항목의 설명이 비면 넣는 문장입니다.
const FALLBACK_WHY_USER_JUDGMENT = '그때의 생각이 기록에 남아 있지 않아 직접 돌아볼 부분이에요.';

const outputTexts = (output: ReviewOutput) => [
  output.summary,
  output.thesisVsOutcome,
  ...output.confirmedFacts.map((fact) => fact.text),
  ...output.possibleFactors.flatMap((factor) => [factor.factor, factor.reason]),
  ...output.userJudgmentItems.flatMap((item) => [item.topic, item.whyUserJudgment, ...item.knownFacts]),
  ...output.glossary.map((entry) => entry.definition),
];

const findMatch = (texts: string[], patterns: RegExp[], prepare = (text: string) => text) => {
  for (const text of texts) {
    for (const pattern of patterns) {
      const match = pattern.exec(prepare(text));
      if (match) return match[0];
    }
  }
  return null;
};

/** 매매 권유·목표가·예측처럼 답변 전체를 다시 만들어야 하는 표현 */
export function findForbiddenPhrase(output: ReviewOutput): string | null {
  return findMatch(outputTexts(output), FORBIDDEN_PATTERNS);
}

/** 손절·비중처럼 피해야 하지만, 그 문장만 지우면 답변을 살릴 수 있는 표현 */
export function findStrategyPhrase(output: ReviewOutput): string | null {
  return findMatch(outputTexts(output), STRATEGY_PATTERNS, withoutQuotes);
}

/**
 * 전략 표현이 든 문장만 지웁니다. 다시 생성해도 같은 표현이 나올 때, 오류 대신 나머지 답을 살리려는 것입니다.
 * 항목이 통째로 비면 그 항목을 빼고, 요약·근거 비교처럼 꼭 있어야 하는 글이 비면 null을 돌려줍니다.
 */
export function removeStrategySentences(output: ReviewOutput): ReviewOutput | null {
  const clean = (text: string) =>
    text
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) => !STRATEGY_PATTERNS.some((pattern) => pattern.test(withoutQuotes(sentence))))
      .join(' ')
      .trim();

  const summary = clean(output.summary);
  const thesisVsOutcome = clean(output.thesisVsOutcome);
  if (!summary || !thesisVsOutcome) return null;

  return {
    summary,
    thesisVsOutcome,
    confirmedFacts: output.confirmedFacts.map((fact) => ({ ...fact, text: clean(fact.text) })).filter((fact) => fact.text),
    possibleFactors: output.possibleFactors
      .map((factor) => ({ ...factor, factor: clean(factor.factor), reason: clean(factor.reason) }))
      .filter((factor) => factor.factor && factor.reason),
    userJudgmentItems: output.userJudgmentItems
      .map((item) => ({
        ...item,
        topic: clean(item.topic),
        knownFacts: item.knownFacts.map(clean).filter(Boolean),
        whyUserJudgment: clean(item.whyUserJudgment) || FALLBACK_WHY_USER_JUDGMENT,
      }))
      .filter((item) => item.topic && item.knownFacts.length),
    glossary: output.glossary.map((entry) => ({ ...entry, definition: clean(entry.definition) })).filter((entry) => entry.definition),
  };
}

export function parseReviewOutput(text: string): ReviewOutput {
  const json: unknown = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  return reviewOutputSchema.parse(json);
}
