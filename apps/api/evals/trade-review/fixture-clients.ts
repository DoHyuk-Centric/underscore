import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NotFoundException } from '@nestjs/common';
import type { DailyPrice } from '@underscore/shared';
import { DailyPriceService } from '../../src/daily-price/daily-price.service.js';
import { KrxTradingClient } from '../../src/popular-stocks/clients/krx-trading.client.js';
import { DartClient, type DartDisclosure } from '../../src/stock-diagnosis/dart.client.js';
import type { GeminiClient } from '../../src/stock-diagnosis/gemini.client.js';
import { NaverNewsClient, type NewsArticle } from '../../src/stock-diagnosis/naver-news.client.js';
import { KrxIndexClient } from '../../src/trade-review/krx-index.client.js';
import { TradeReviewService } from '../../src/trade-review/trade-review.service.js';
import type { TradeReviewScenario } from './scenarios.js';

/**
 * 시나리오 하나의 외부 응답 스냅샷. 기사 검색 결과처럼 날마다 바뀌는 입력을 고정해서,
 * 회차 사이의 차이가 프롬프트·코드 변경 때문인지 입력 변화 때문인지 섞이지 않게 합니다.
 */
export interface TradeReviewFixture {
  capturedAt: string;
  /** 날짜(YYYYMMDD)별 시세. 휴장일처럼 시세가 없던 날은 null */
  dailyPrices: Record<string, DailyPrice | null>;
  disclosures: DartDisclosure[];
  /** 지수명 → 날짜별 종가 */
  marketIndex: Record<string, Record<string, number | null>>;
  news: NewsArticle[];
}

interface ExternalClients {
  dailyPriceService: DailyPriceService;
  dartClient: DartClient;
  krxIndexClient: KrxIndexClient;
  naverNewsClient: NaverNewsClient;
}

const fixturePath = (scenario: TradeReviewScenario) =>
  fileURLToPath(new URL(`./fixtures/${scenario.id}.json`, import.meta.url));

export function createReviewService(clients: ExternalClients, gemini: GeminiClient): TradeReviewService {
  return new TradeReviewService(
    clients.dailyPriceService,
    clients.dartClient,
    gemini,
    clients.krxIndexClient,
    clients.naverNewsClient,
  );
}

// ==================== 평가: 고정 입력을 돌려주는 외부 클라이언트 만들기 ====================

export function loadFixture(scenario: TradeReviewScenario): TradeReviewFixture {
  const path = fixturePath(scenario);
  if (!existsSync(path)) {
    throw new Error(`고정 입력이 없어요: ${path}. pnpm --filter api eval:capture로 먼저 받아 주세요.`);
  }
  return JSON.parse(readFileSync(path, 'utf8')) as TradeReviewFixture;
}

/** 실제 클라이언트와 같은 메서드만 흉내 냅니다. 고정 입력에 없는 요청은 실제 API처럼 "없음"으로 답합니다. */
export function createFixtureClients(fixture: TradeReviewFixture): ExternalClients {
  const dailyPriceService = {
    getDailyPrice: async (_stockCode: string, date: string) => {
      const price = fixture.dailyPrices[date];
      if (!price) throw new NotFoundException('고정 입력에 이날 시세가 없어요.');
      return price;
    },
  };
  const dartClient = {
    isConfigured: () => true,
    findCorpCode: async () => 'fixture',
    getDisclosuresBetween: async () => fixture.disclosures,
  };
  const krxIndexClient = {
    isConfigured: () => true,
    getClose: async (indexName: string, date: string) => fixture.marketIndex[indexName]?.[date] ?? null,
  };
  const naverNewsClient = {
    isConfigured: () => true,
    searchNewsBetween: async () => fixture.news,
  };

  return {
    dailyPriceService: dailyPriceService as unknown as DailyPriceService,
    dartClient: dartClient as unknown as DartClient,
    krxIndexClient: krxIndexClient as unknown as KrxIndexClient,
    naverNewsClient: naverNewsClient as unknown as NaverNewsClient,
  };
}

// ==================== 캡처: 실제 API 응답을 기록하는 외부 클라이언트 만들기 ====================

/** 실제 클라이언트를 그대로 쓰면서, 서비스가 받은 응답을 고정 입력 형식으로 모읍니다. */
export function createRecordingClients(): { clients: ExternalClients; fixture: TradeReviewFixture } {
  const fixture: TradeReviewFixture = {
    capturedAt: new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10),
    dailyPrices: {},
    disclosures: [],
    marketIndex: {},
    news: [],
  };

  const dailyPriceService = new DailyPriceService(new KrxTradingClient());
  const getDailyPrice = dailyPriceService.getDailyPrice.bind(dailyPriceService);
  dailyPriceService.getDailyPrice = async (stockCode, date) => {
    try {
      const price = await getDailyPrice(stockCode, date);
      fixture.dailyPrices[date] = price;
      return price;
    } catch (error) {
      fixture.dailyPrices[date] = null;
      throw error;
    }
  };

  const dartClient = new DartClient();
  const getDisclosuresBetween = dartClient.getDisclosuresBetween.bind(dartClient);
  dartClient.getDisclosuresBetween = async (...args) => (fixture.disclosures = await getDisclosuresBetween(...args));

  const krxIndexClient = new KrxIndexClient();
  const getClose = krxIndexClient.getClose.bind(krxIndexClient);
  krxIndexClient.getClose = async (indexName, date) => {
    const close = await getClose(indexName, date);
    (fixture.marketIndex[indexName] ??= {})[date] = close;
    return close;
  };

  const naverNewsClient = new NaverNewsClient();
  const searchNewsBetween = naverNewsClient.searchNewsBetween.bind(naverNewsClient);
  naverNewsClient.searchNewsBetween = async (...args) => (fixture.news = await searchNewsBetween(...args));

  return { clients: { dailyPriceService, dartClient, krxIndexClient, naverNewsClient }, fixture };
}

export function saveFixture(scenario: TradeReviewScenario, fixture: TradeReviewFixture): string {
  const path = fixturePath(scenario);
  writeFileSync(path, `${JSON.stringify(fixture, null, 2)}\n`);
  return path;
}
