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

export function findForbiddenPhrase(output: ReviewOutput): string | null {
  const texts = [
    output.summary,
    output.thesisVsOutcome,
    ...output.confirmedFacts.map((fact) => fact.text),
    ...output.possibleFactors.flatMap((factor) => [factor.factor, factor.reason]),
    ...output.userJudgmentItems.flatMap((item) => [item.topic, item.whyUserJudgment, ...item.knownFacts]),
    ...output.glossary.map((entry) => entry.definition),
  ];

  for (const text of texts) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      const match = pattern.exec(text);
      if (match) return match[0];
    }
  }

  return null;
}

export function parseReviewOutput(text: string): ReviewOutput {
  const json: unknown = JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''));
  return reviewOutputSchema.parse(json);
}
