import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

const GEMINI_API_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models';
// 문장 품질이 좋은 flash를 먼저 쓰고, 과부하(503)나 한도 초과(429)면 lite로 넘어갑니다.
const DEFAULT_GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
const FALLBACK_STATUS = new Set([429, 500, 503]);

export interface GeminiJsonResult {
  text: string;
  model: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

/** GEMINI_MODEL에 쉼표로 여러 모델을 적으면 앞에서부터 순서대로 시도합니다. */
export function resolveGeminiModels(value = process.env.GEMINI_MODEL): string[] {
  const models = (value ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return models.length > 0 ? models : DEFAULT_GEMINI_MODELS;
}

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateJson(params: {
    systemInstruction: string;
    prompt: string;
    responseSchema: Record<string, unknown>;
  }): Promise<GeminiJsonResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
    }

    const models = resolveGeminiModels();
    let lastError: unknown;

    for (const model of models) {
      try {
        const text = await this.request(model, apiKey, params);
        return { text, model };
      } catch (error) {
        lastError = error;
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;

        if (!status || !FALLBACK_STATUS.has(status)) throw error;

        this.logger.warn(`${model} 응답 ${status}, 다음 모델로 넘어갑니다.`);
      }
    }

    throw lastError;
  }

  private async request(
    model: string,
    apiKey: string,
    params: {
      systemInstruction: string;
      prompt: string;
      responseSchema: Record<string, unknown>;
    },
  ): Promise<string> {
    const response = await axios.post<GeminiResponse>(
      `${GEMINI_API_BASE_URL}/${model}:generateContent`,
      {
        systemInstruction: { parts: [{ text: params.systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: params.prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: params.responseSchema,
        },
      },
      {
        headers: { 'x-goog-api-key': apiKey },
        timeout: 60_000,
      },
    );

    const text = (response.data.candidates?.[0]?.content?.parts ?? [])
      .map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      throw new Error('Gemini 응답에 텍스트가 없습니다.');
    }

    return text;
  }
}
