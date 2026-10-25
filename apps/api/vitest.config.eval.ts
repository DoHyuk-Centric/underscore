import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// AI 답변 평가(게이트). Gemini를 실제로 호출하므로 단위 테스트(`pnpm test`)와 따로 돌립니다.
// --mode capture: 고정 입력 다시 받기, --mode rescore: 저장된 결과를 현재 기준으로 다시 채점
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['evals/**/*.eval.ts'],
    setupFiles: ['evals/setup.ts'],
    testTimeout: 20 * 60_000,
    hookTimeout: 20 * 60_000,
    // 시나리오를 차례로 돌려 Gemini 분당 한도를 넘지 않게 합니다.
    fileParallelism: false,
  },
});
