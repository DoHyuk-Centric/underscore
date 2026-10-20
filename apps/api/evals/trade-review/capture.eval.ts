// 시나리오의 외부 응답(시세·공시·지수·기사)을 실제 API로 다시 받아 fixtures/에 저장합니다. Gemini는 부르지 않습니다.
// 기사 검색 결과가 바뀌므로, 고정 입력을 갱신하면 그 커밋에서 기준 점수도 다시 확인해야 합니다.
// usage: pnpm --filter api eval:capture
import { createSilentGemini } from './eval-gemini.js';
import { createRecordingClients, createReviewService, saveFixture } from './fixture-clients.js';
import { SCENARIOS } from './scenarios.js';

describe.runIf(import.meta.env.MODE === 'capture')('고정 입력 받기: 거래 복기', () => {
  it.each(SCENARIOS)('$label', async (scenario) => {
    const { clients, fixture } = createRecordingClients();

    await createReviewService(clients, createSilentGemini()).review(scenario.request);
    const path = saveFixture(scenario, fixture);

    console.log(
      `${scenario.id}: 시세 ${Object.keys(fixture.dailyPrices).length}일, 공시 ${fixture.disclosures.length}건, 기사 ${fixture.news.length}건 → ${path}`,
    );
    expect(Object.values(fixture.dailyPrices).some(Boolean)).toBe(true);
  });
});
