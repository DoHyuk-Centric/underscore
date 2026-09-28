import { z } from 'zod';

export const diagnosisOutputSchema = z.object({
  headline: z.string().min(1).max(400),
  companyIntro: z.string().min(1).max(500).nullable(),
  impactContext: z.string().min(1).max(800).nullable(),
  marketContext: z.array(z.string().min(1).max(300)).max(3),
  caution: z.string().min(1).max(500),
  newsIds: z.array(z.number().int().positive()).max(3),
  disclosureIds: z.array(z.number().int().positive()).max(2).default([]),
});

export type DiagnosisOutput = z.infer<typeof diagnosisOutputSchema>;

/** Gemini 구조화 출력(responseSchema)에 전달하는 스키마입니다. */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    headline: { type: 'STRING' },
    companyIntro: { type: 'STRING', nullable: true },
    impactContext: { type: 'STRING', nullable: true },
    marketContext: { type: 'ARRAY', items: { type: 'STRING' } },
    caution: { type: 'STRING' },
    newsIds: { type: 'ARRAY', items: { type: 'INTEGER' } },
    disclosureIds: { type: 'ARRAY', items: { type: 'INTEGER' } },
  },
  required: [
    'headline',
    'companyIntro',
    'impactContext',
    'marketContext',
    'caution',
    'newsIds',
    'disclosureIds',
  ],
};

// 매수·매도 권유, 목표가·손절가 제시 표현을 걸러냅니다. "매수 전에 확인하세요" 같은 안내는 허용합니다.
const FORBIDDEN_PATTERNS = [
  /(매수|매도|보유|추격\s*매수|분할\s*매수)\s*(를|은|는)?\s*(하세요|해\s*보세요|추천|권유|고려|타이밍|시점)/,
  /(사세요|파세요|담으세요|팔아야|사야|들고\s*가세요)/,
  /목표\s*주?가/,
  /손절\s*(가|선|라인)?/,
];

export function findForbiddenPhrase(output: DiagnosisOutput): string | null {
  const texts = [
    output.headline,
    output.companyIntro,
    output.impactContext,
    ...output.marketContext,
    output.caution,
  ];

  for (const text of texts) {
    if (!text) continue;
    for (const pattern of FORBIDDEN_PATTERNS) {
      const match = pattern.exec(text);
      if (match) return match[0];
    }
  }

  return null;
}

export function parseDiagnosisOutput(text: string): DiagnosisOutput {
  const json: unknown = JSON.parse(
    text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''),
  );
  return diagnosisOutputSchema.parse(json);
}
