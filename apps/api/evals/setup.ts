import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

// 로컬에서는 apps/api/.env를 읽고, CI에서는 GitHub Secrets로 넣은 환경변수를 그대로 씁니다.
config({ path: fileURLToPath(new URL('../.env', import.meta.url)), quiet: true });

// Gemini 한도는 구글 프로젝트·모델 단위로 셉니다. 평가가 서비스(종목 진단 크론, 사용자 복기)의 한도를 쓰지 않도록,
// 다른 프로젝트에서 발급한 평가용 키가 있으면 그 키로 부릅니다.
if (process.env.EVAL_GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = process.env.EVAL_GEMINI_API_KEY;
} else {
  console.warn('EVAL_GEMINI_API_KEY가 없어 서비스와 같은 Gemini 키로 평가해요. 서비스의 하루 한도를 함께 써요.');
}

// 회차끼리 비교할 수 있도록 모델을 하나로 고정합니다. 과부하면 다른 모델로 넘어가지 않고 기다렸다 다시 시도합니다(eval-gemini.ts).
// 기본은 lite입니다. 무료 등급에서는 과부하(503)로 실패한 호출도 하루 횟수(모델당 20회)에 들어가는데,
// flash는 과부하가 잦아 게이트를 끝까지 못 돌리는 날이 많았습니다. flash는 EVAL_GEMINI_MODEL로 골라 따로 확인합니다.
process.env.GEMINI_MODEL = process.env.EVAL_GEMINI_MODEL || 'gemini-3.5-flash-lite';
