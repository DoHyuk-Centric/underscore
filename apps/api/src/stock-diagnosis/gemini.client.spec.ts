import axios from 'axios';
import { GeminiClient, resolveGeminiModels } from './gemini.client.js';

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return {
    default: { ...actual.default, post: vi.fn() },
  };
});

const post = vi.mocked(axios.post);

const httpError = (status: number) =>
  Object.assign(new Error(`status ${status}`), {
    isAxiosError: true,
    response: { status },
  });

const ok = (text: string) => ({
  data: { candidates: [{ content: { parts: [{ text }] } }] },
});

const params = { systemInstruction: 's', prompt: 'p', responseSchema: {} };

describe('resolveGeminiModels', () => {
  it('설정이 없으면 flash, flash-lite 순서로 시도한다', () => {
    expect(resolveGeminiModels(undefined)).toEqual([
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
    ]);
  });

  it('쉼표로 구분한 모델 목록을 사용한다', () => {
    expect(resolveGeminiModels(' a , b ,')).toEqual(['a', 'b']);
  });
});

describe('GeminiClient.generateJson', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    delete process.env.GEMINI_MODEL;
    post.mockReset();
  });

  it('첫 모델이 503이면 다음 모델로 넘어가 결과와 실제 사용한 모델을 반환한다', async () => {
    post.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(ok('{"a":1}'));

    const result = await new GeminiClient().generateJson(params);

    expect(result).toEqual({ text: '{"a":1}', model: 'gemini-3.5-flash-lite' });
    expect(post.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('/gemini-3.5-flash:generateContent'),
      expect.stringContaining('/gemini-3.5-flash-lite:generateContent'),
    ]);
  });

  it('400처럼 모델을 바꿔도 해결되지 않는 오류는 바로 던진다', async () => {
    post.mockRejectedValueOnce(httpError(400));

    await expect(new GeminiClient().generateJson(params)).rejects.toThrow('status 400');
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('모든 모델이 과부하면 마지막 오류를 던진다', async () => {
    post.mockRejectedValueOnce(httpError(503)).mockRejectedValueOnce(httpError(429));

    await expect(new GeminiClient().generateJson(params)).rejects.toThrow('status 429');
  });
});
