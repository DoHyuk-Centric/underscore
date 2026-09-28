import type { PopularStock } from '@underscore/shared';
import type { DrizzleDb } from '../db/drizzle.module.js';
import type { PopularSectorService } from '../popular-sectors/popular-sector.service.js';
import type {
  DartClient,
  DartCompanyProfile,
  DartDisclosure,
} from './dart.client.js';
import type { GeminiClient } from './gemini.client.js';
import type { NaverNewsClient, NewsArticle } from './naver-news.client.js';
import { StockDiagnosisService } from './stock-diagnosis.service.js';

const stock = (rank: number, stockCode: string, name: string): PopularStock => ({
  rank,
  stockCode,
  name,
  market: 'KOSPI',
  price: 1000,
  change: 300,
  changeRate: 30,
  volume: 1000,
  tradingValue: 1_000_000,
});

const articles: NewsArticle[] = [
  { id: 1, title: '기사1', description: '', url: 'https://news.example.com/1', publishedDate: '2026-09-17' },
  { id: 2, title: '기사2', description: '', url: 'https://news.example.com/2', publishedDate: '2026-09-17' },
];

const output = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    headline: '공급계약 소식에 30% 올랐어요.',
    companyIntro: null,
    impactContext: null,
    marketContext: [],
    caution: '변동성이 커질 수 있어요.',
    newsIds: [2, 99],
    ...overrides,
  });

function setup({
  savedCodes = [] as string[],
  surging = [stock(1, '042370', '비츠로테크'), stock(2, '348080', '큐라티스')],
} = {}) {
  const inserted: Record<string, unknown>[] = [];
  const db = {
    select: () => ({
      from: () => ({
        where: async () => savedCodes.map((stockCode) => ({ stockCode })),
      }),
    }),
    insert: () => ({
      values: (row: Record<string, unknown>) => ({
        onConflictDoUpdate: async () => {
          inserted.push(row);
        },
      }),
    }),
  } as unknown as DrizzleDb;

  const popularSectorService = {
    getPopularSectorSnapshot: async () => ({
      checkedDate: '20260926',
      baseDate: '20260917',
      stocks: surging,
    }),
  } as unknown as PopularSectorService;

  const naver = {
    isConfigured: () => true,
    searchStockNews: vi.fn(async () => articles),
  };
  const gemini = {
    isConfigured: () => true,
    generateJson: vi.fn(async () => ({ text: output(), model: 'gemini-test' })),
  };
  const dart = {
    isConfigured: () => false,
    findCorpCode: vi.fn(async () => '00123456'),
    getCompanyProfile: vi.fn(async () => company),
    getRecentDisclosures: vi.fn(async () => disclosures),
  };

  const service = new StockDiagnosisService(
    db,
    popularSectorService,
    naver as unknown as NaverNewsClient,
    gemini as unknown as GeminiClient,
    dart as unknown as DartClient,
  );
  (service as unknown as { retryDelayMs: number }).retryDelayMs = 0;

  return { service, inserted, naver, gemini, dart };
}

const company: DartCompanyProfile = {
  corpName: '비츠로테크',
  establishedDate: '1968-05-01',
  homepage: null,
  businessOverview: '전력기기와 특수전지를 만들어요.',
};

const disclosures: DartDisclosure[] = [
  {
    id: 1,
    title: '단일판매ㆍ공급계약체결(자회사의 주요경영사항)',
    receivedDate: '2026-09-17',
    url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260917000001',
    excerpt: '계약금액 45억원, 매출액대비 14.9%',
  },
];

describe('StockDiagnosisService', () => {
  it('급등 종목마다 진단을 생성해 기준일과 함께 저장한다', async () => {
    const { service, inserted } = setup();

    await service.generateDiagnoses();

    expect(inserted).toHaveLength(2);
    expect(inserted[0]).toMatchObject({
      stockCode: '042370',
      baseDate: '2026-09-17',
      stockName: '비츠로테크',
      rank: 1,
      headline: '공급계약 소식에 30% 올랐어요.',
      model: 'gemini-test',
    });
  });

  it('AI가 고른 기사 중 실제로 검색된 기사의 링크만 저장한다', async () => {
    const { service, inserted } = setup();

    await service.generateDiagnoses();

    // newsIds [2, 99] 중 99는 존재하지 않는 기사라 버린다.
    expect(inserted[0].news).toEqual([
      { title: '기사2', url: 'https://news.example.com/2' },
    ]);
  });

  it('DART 회사 개요와 공시를 프롬프트에 넣고, AI가 고른 공시 링크를 기사보다 먼저 저장한다', async () => {
    const { service, inserted, gemini, dart } = setup({
      surging: [stock(1, '042370', '비츠로테크')],
    });
    dart.isConfigured = () => true;
    gemini.generateJson.mockResolvedValueOnce({
      text: output({ disclosureIds: [1], newsIds: [2] }),
      model: 'gemini-test',
    });

    await service.generateDiagnoses();

    const [{ prompt }] = gemini.generateJson.mock.calls[0] as unknown as [
      { prompt: string },
    ];
    expect(prompt).toContain('전력기기와 특수전지를 만들어요.');
    expect(prompt).toContain('매출액대비 14.9%');
    expect(inserted[0].news).toEqual([
      {
        title: '[공시] 단일판매ㆍ공급계약체결(자회사의 주요경영사항)',
        url: 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260917000001',
      },
      { title: '기사2', url: 'https://news.example.com/2' },
    ]);
  });

  it('DART 조회가 실패해도 뉴스만으로 진단을 저장한다', async () => {
    const { service, inserted, dart } = setup({
      surging: [stock(1, '042370', '비츠로테크')],
    });
    dart.isConfigured = () => true;
    dart.findCorpCode.mockRejectedValueOnce(new Error('DART 오류 020'));

    await service.generateDiagnoses();

    expect(inserted).toHaveLength(1);
  });

  it('이미 저장된 종목은 건너뛴다', async () => {
    const { service, inserted, gemini } = setup({ savedCodes: ['042370'] });

    await service.generateDiagnoses();

    expect(gemini.generateJson).toHaveBeenCalledTimes(1);
    expect(inserted.map((row) => row.stockCode)).toEqual(['348080']);
  });

  it('급등 종목이 10개를 넘어도 10개까지만 진단한다', async () => {
    const surging = Array.from({ length: 12 }, (_, i) =>
      stock(i + 1, `00000${i}`, `종목${i}`),
    );
    const { service, inserted } = setup({ surging });

    await service.generateDiagnoses();

    expect(inserted).toHaveLength(10);
  });

  it('금지 표현이 나오면 다시 생성한다', async () => {
    const { service, inserted, gemini } = setup({
      surging: [stock(1, '042370', '비츠로테크')],
    });
    gemini.generateJson
      .mockResolvedValueOnce({
        text: output({ caution: '지금 매수하세요' }),
        model: 'gemini-test',
      })
      .mockResolvedValueOnce({ text: output(), model: 'gemini-test' });

    await service.generateDiagnoses();

    expect(gemini.generateJson).toHaveBeenCalledTimes(2);
    expect(inserted).toHaveLength(1);
    expect(inserted[0].caution).toBe('변동성이 커질 수 있어요.');
  });

  it('한 종목이 계속 실패해도 나머지 종목은 저장한다', async () => {
    const { service, inserted, gemini } = setup();
    gemini.generateJson
      .mockRejectedValueOnce(new Error('503'))
      .mockRejectedValueOnce(new Error('503'))
      .mockRejectedValueOnce(new Error('503'));

    await service.generateDiagnoses();

    expect(inserted.map((row) => row.stockCode)).toEqual(['348080']);
  });

  it('뉴스 검색이 실패한 종목은 저장하지 않는다', async () => {
    const { service, inserted, naver } = setup();
    naver.searchStockNews.mockRejectedValueOnce(new Error('401'));

    await service.generateDiagnoses();

    expect(inserted.map((row) => row.stockCode)).toEqual(['348080']);
  });

  it('API 키가 없으면 아무것도 호출하지 않는다', async () => {
    const { service, inserted, naver, gemini } = setup();
    gemini.isConfigured = () => false;

    await service.generateDiagnoses();

    expect(naver.searchStockNews).not.toHaveBeenCalled();
    expect(inserted).toHaveLength(0);
  });
});

describe('StockDiagnosisService.getDiagnoses', () => {
  function setupWithRows(rows: Record<string, unknown>[]) {
    const dates = [...new Set(rows.map((row) => row.baseDate as string))].sort();
    const latestDate = dates.at(-1);
    const db = {
      select: () => ({
        from: () => ({
          orderBy: () => ({
            limit: async () => (latestDate ? [{ baseDate: latestDate }] : []),
          }),
          where: () => ({
            orderBy: async () =>
              rows
                .filter((row) => row.baseDate === latestDate)
                .sort((a, b) => (a.rank as number) - (b.rank as number)),
          }),
        }),
      }),
    } as unknown as DrizzleDb;

    return new StockDiagnosisService(
      db,
      {} as unknown as PopularSectorService,
      {} as unknown as NaverNewsClient,
      {} as unknown as GeminiClient,
      {} as unknown as DartClient,
    );
  }

  it('가장 최근 기준일의 진단만 순위순으로 반환한다', async () => {
    const service = setupWithRows([
      {
        baseDate: '2026-09-16',
        rank: 1,
        stockCode: 'old',
        stockName: '어제종목',
        headline: '어제 헤드라인',
        companyIntro: null,
        impactContext: null,
        marketContext: [],
        news: [],
        caution: '어제 주의',
      },
      {
        baseDate: '2026-09-17',
        rank: 2,
        stockCode: '348080',
        stockName: '큐라티스',
        headline: '헤드라인2',
        companyIntro: null,
        impactContext: null,
        marketContext: [],
        news: [],
        caution: '주의2',
      },
      {
        baseDate: '2026-09-17',
        rank: 1,
        stockCode: '042370',
        stockName: '비츠로테크',
        headline: '헤드라인1',
        companyIntro: '회사 소개',
        impactContext: null,
        marketContext: ['시황'],
        news: [{ title: '기사', url: 'https://news.example.com/1' }],
        caution: '주의1',
      },
    ]);

    const diagnoses = await service.getDiagnoses();

    expect(diagnoses.map((d) => d.stockCode)).toEqual(['042370', '348080']);
    expect(diagnoses[0]).toMatchObject({
      rank: 1,
      stockName: '비츠로테크',
      headline: '헤드라인1',
      companyIntro: '회사 소개',
      marketContext: ['시황'],
      news: [{ title: '기사', url: 'https://news.example.com/1' }],
    });
  });

  it('저장된 진단이 없으면 빈 배열을 반환한다', async () => {
    const service = setupWithRows([]);

    expect(await service.getDiagnoses()).toEqual([]);
  });
});
