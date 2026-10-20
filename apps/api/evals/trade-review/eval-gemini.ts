import axios from 'axios';
import { GeminiClient } from '../../src/stock-diagnosis/gemini.client.js';

export interface GeminiCall {
  ok: boolean;
  model: string | null;
  ms: number;
  status?: number;
  prompt?: string;
}

// 과부하(503)·서버 오류(500)는 잠깐 기다리면 풀리는 경우가 많아, 모델을 바꾸지 않고 같은 모델로 다시 시도합니다.
const RETRY_STATUS = new Set([500, 503]);
const MAX_RETRIES = 4;
const RETRY_WAIT_MS = 20_000;
// 분당 한도(429)는 응답이 알려준 시간만큼 기다립니다. 너무 길면 기다리지 않고 실패로 둡니다.
const MAX_RATE_LIMIT_WAIT_MS = 90_000;

/** 품질 판정과 상관없는 실패(한도 초과 등). 결과에 따로 표시해 "답변이 나빴다"와 구분합니다. */
export class GeminiUnavailableError extends Error {}

/**
 * 하루 한도에 걸리면 그날은 기다려도 풀리지 않습니다. 한 번 걸리면 남은 회차는 호출하지 않고 판정 불가로 둡니다.
 */
export const geminiQuota = { exhaustedReason: null as string | null };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface QuotaDetails {
  daily: boolean;
  retryAfterMs: number | null;
}

/** 429 응답 본문에서 하루 한도인지, 얼마 뒤 다시 시도하라는지 읽습니다. */
function readQuotaDetails(error: unknown): QuotaDetails {
  const details: { violations?: { quotaId?: string }[]; retryDelay?: string }[] = axios.isAxiosError(error)
    ? (error.response?.data?.error?.details ?? [])
    : [];
  const daily = details.some((detail) => detail.violations?.some((violation) => /PerDay/i.test(violation.quotaId ?? '')));
  const delay = details.find((detail) => detail.retryDelay)?.retryDelay;
  return { daily, retryAfterMs: delay ? Number.parseFloat(delay) * 1000 : null };
}

/** 실제 Gemini를 부르되, 호출 기록을 남기고 일시적인 과부하·분당 한도는 다시 시도합니다. */
export function createEvalGemini(): { gemini: GeminiClient; calls: GeminiCall[] } {
  const gemini = new GeminiClient();
  const calls: GeminiCall[] = [];
  const generateJson = gemini.generateJson.bind(gemini);

  gemini.generateJson = async (params) => {
    if (geminiQuota.exhaustedReason) throw new GeminiUnavailableError(geminiQuota.exhaustedReason);

    for (let retry = 0; ; retry++) {
      const startedAt = Date.now();
      try {
        const result = await generateJson(params);
        calls.push({ ok: true, model: result.model, ms: Date.now() - startedAt, prompt: params.prompt });
        return result;
      } catch (error) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        calls.push({ ok: false, model: null, ms: Date.now() - startedAt, status });

        if (status === 429) await waitForRateLimit(error, retry);
        else if (!status || !RETRY_STATUS.has(status) || retry >= MAX_RETRIES) throw error;
        else await sleep(RETRY_WAIT_MS * (retry + 1));
      }
    }
  };

  return { gemini, calls };
}

/** 분당 한도면 기다렸다 다시 시도하고, 하루 한도거나 너무 오래 기다려야 하면 판정 불가로 멈춥니다. */
async function waitForRateLimit(error: unknown, retry: number): Promise<void> {
  const { daily, retryAfterMs } = readQuotaDetails(error);
  const wait = retryAfterMs ?? RETRY_WAIT_MS;

  if (daily || wait > MAX_RATE_LIMIT_WAIT_MS || retry >= MAX_RETRIES) {
    geminiQuota.exhaustedReason = daily
      ? `Gemini 하루 한도 초과(${process.env.GEMINI_MODEL})라 답변을 받지 못했어요`
      : 'Gemini 한도 초과(429)라 답변을 받지 못했어요';
    throw new GeminiUnavailableError(geminiQuota.exhaustedReason);
  }
  await sleep(wait);
}

/** 고정 입력을 받을 때 쓰는 가짜 Gemini. 한도를 쓰지 않도록, 형식만 맞는 빈 답을 돌려줍니다. */
export function createSilentGemini(): GeminiClient {
  const output = { summary: '-', thesisVsOutcome: '-', confirmedFacts: [], possibleFactors: [], userJudgmentItems: [], glossary: [] };
  const gemini = {
    isConfigured: () => true,
    generateJson: async () => ({ text: JSON.stringify(output), model: 'capture' }),
  };
  return gemini as unknown as GeminiClient;
}
