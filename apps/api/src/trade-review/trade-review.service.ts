import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  getTradeEntryPriceIssues,
  type DailyPrice,
  type TradeEntry,
  type TradeReview,
  type TradeReviewMetrics,
  type TradeReviewRequest,
  type TradeReviewSource,
} from '@underscore/shared';
import { DailyPriceService } from '../daily-price/daily-price.service.js';
import { DartClient, type DartDisclosure } from '../stock-diagnosis/dart.client.js';
import { GeminiClient } from '../stock-diagnosis/gemini.client.js';
import { NaverNewsClient, type NewsArticle } from '../stock-diagnosis/naver-news.client.js';
import { KrxIndexClient } from './krx-index.client.js';
import { comparePrices, type MarketIndexCloses } from './trade-review.comparisons.js';
import { buildReviewPrompt, REVIEW_SYSTEM_PROMPT, type ReviewContext } from './trade-review.prompt.js';
import {
  findForbiddenPhrase,
  GEMINI_REVIEW_SCHEMA,
  parseReviewOutput,
  type ReviewOutput,
} from './trade-review.schema.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// 보유 기간이 길어도 프롬프트가 커지지 않도록 공시 건수와 발췌 길이를 제한합니다.
// 실적 공시는 표 머리글 뒤에 수치가 나와서 발췌를 넉넉히 둡니다.
const MAX_REVIEW_DISCLOSURES = 5;
const REVIEW_DISCLOSURE_EXCERPT_LENGTH = 1_000;
// 지분 신고·IR 안내는 복기의 근거로 쓰기 어렵고 공시 자리만 차지해 뺍니다. 급등 진단과 달리 자기주식 취득 결과는 남깁니다.
const REVIEW_NOISE_PATTERN = /소유상황보고서|거래계획보고서|기업설명회|소유주식변동신고서|대량보유상황보고서/;
// 코스피·코스닥 종목을 함께 비교할 수 있는 시장 대표 지수입니다.
const MARKET_INDEX_NAME = 'KRX 300';
// 공시는 숫자만 알려줘서, "왜 그런 실적·계약이 나왔는지"는 같은 기간 기사에서 찾습니다.
// 검색어마다 최대 2건이라, 실적 기사만으로 자리가 차지 않도록 넉넉히 둡니다.
const MAX_REVIEW_NEWS = 8;
// 공시 종류마다 그 배경을 다룬 기사를 찾을 검색어입니다. 앞에 있을수록 먼저 고릅니다.
// "실적"만으로는 기간 안 기사가 거의 없고, "실적 견인"은 실적을 이끈 사업을, "실적 배경"은 발표 뒤 주가 흐름의 배경을 다룬 기사를 잘 찾습니다.
const NEWS_KEYWORDS_BY_DISCLOSURE: [RegExp, string[]][] = [
  [/실적|매출액또는손익구조/, ['실적 견인', '실적 배경', '영업이익']],
  [/공급계약|판매/, ['공급계약', '수주']],
  [/유형자산|신규시설|타법인주식/, ['투자']],
  [/자기주식|주식소각/, ['자사주']],
  [/유상증자|전환사채|신주인수권/, ['유상증자']],
];
// 건수 제한에 걸릴 때 실적·계약·투자처럼 판단과 닿아 있는 공시를 먼저 고릅니다. 목록에 없는 공시는 맨 뒤입니다.
const REVIEW_DISCLOSURE_PRIORITY = [
  /실적|매출액또는손익구조/,
  /공급계약|판매/,
  /유형자산|타법인주식|신규시설|투자판단/,
  /유상증자|무상증자|전환사채|신주인수권|자기주식|주식소각|현금ㆍ현물배당/,
  /차입|채무보증|담보/,
  /풍문|해명|조회공시/,
];
// 형식 오류나 금지 표현이 나오면 한 번 더 생성합니다.
const MAX_GENERATION_ATTEMPTS = 2;

const sumQuantity = (entries: TradeEntry[]) => entries.reduce((total, entry) => total + entry.quantity, 0);

const exactAveragePrice = (entries: TradeEntry[]) =>
  entries.reduce((total, entry) => total + entry.price * entry.quantity, 0) / sumQuantity(entries);

const toUtcDate = (key: string) =>
  Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)));

const formatDate = (key: string) => `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`;

const rankReviewDisclosure = (title: string) => {
  const rank = REVIEW_DISCLOSURE_PRIORITY.findIndex((pattern) => pattern.test(title));
  return rank === -1 ? REVIEW_DISCLOSURE_PRIORITY.length : rank;
};

@Injectable()
export class TradeReviewService {
  private readonly logger = new Logger(TradeReviewService.name);

  constructor(
    private readonly dailyPriceService: DailyPriceService,
    private readonly dartClient: DartClient,
    private readonly geminiClient: GeminiClient,
    private readonly krxIndexClient: KrxIndexClient,
    private readonly naverNewsClient: NaverNewsClient,
  ) {}

  async review(request: TradeReviewRequest): Promise<TradeReview> {
    if (!this.geminiClient.isConfigured()) {
      throw new ServiceUnavailableException('AI 분석을 사용할 수 없어요.');
    }

    const tradeDayPrices = await this.verifyWithDailyPrices(request);
    const metrics = this.calculateMetrics(request, tradeDayPrices.values().next().value!.name);
    const disclosures = await this.loadDisclosures(metrics);
    const keyDayPrices = await this.addDisclosureDayPrices(request.stockCode, tradeDayPrices, disclosures);
    const marketIndex = await this.loadMarketIndex(metrics);
    const news = await this.loadNews(metrics, disclosures);
    const comparisons = comparePrices(request, metrics, keyDayPrices, disclosures, marketIndex);
    const output = await this.generate({
      request,
      metrics,
      dailyPrices: [...keyDayPrices.values()],
      disclosures,
      news,
      comparisons,
    });

    return { metrics, ...output, ...this.attachSources(output, metrics, disclosures, news, marketIndex !== null) };
  }

  // ==================== 준비: 거래를 그날 시세로 검증하고 손익 계산하기 ====================

  /** 화면에서 한 검증을 서버에서 다시 합니다. 화면을 거치지 않은 요청도 그날 시세로 가능한 거래만 받습니다. */
  private async verifyWithDailyPrices(request: TradeReviewRequest): Promise<Map<string, DailyPrice>> {
    const dates = [...new Set([...request.buys, ...request.sells].map((entry) => entry.date))].sort();
    const pricesByDate = await this.loadDailyPrices(request.stockCode, dates);

    // 같은 날 분할 건의 합계를 검사하려고 매수와 매도를 각각의 목록으로 넘깁니다.
    this.rejectImpossibleEntries(request.buys, pricesByDate);
    this.rejectImpossibleEntries(request.sells, pricesByDate);

    return pricesByDate;
  }

  private async loadDailyPrices(stockCode: string, dates: string[]): Promise<Map<string, DailyPrice>> {
    const pricesByDate = new Map<string, DailyPrice>();

    for (const date of dates) {
      try {
        pricesByDate.set(date, await this.dailyPriceService.getDailyPrice(stockCode, date));
      } catch (error) {
        const reason = error instanceof HttpException ? error.message : '시세를 확인하지 못했어요.';
        throw new BadRequestException(`${formatDate(date)}: ${reason}`);
      }
    }

    return pricesByDate;
  }

  private rejectImpossibleEntries(entries: TradeEntry[], pricesByDate: Map<string, DailyPrice>): void {
    entries.forEach((entry, index) => {
      const [issue] = getTradeEntryPriceIssues(entries, index, pricesByDate.get(entry.date)!);
      if (issue) throw new BadRequestException(`${formatDate(entry.date)}: ${issue.message}`);
    });
  }

  private calculateMetrics(request: TradeReviewRequest, stockName: string): TradeReviewMetrics {
    const buyDates = request.buys.map((entry) => entry.date).sort();
    const sellDates = request.sells.map((entry) => entry.date).sort();
    const firstBuyDate = buyDates[0];
    const lastSellDate = sellDates[sellDates.length - 1];

    const buyQuantity = sumQuantity(request.buys);
    const sellQuantity = sumQuantity(request.sells);
    const averageBuy = exactAveragePrice(request.buys);
    const averageSell = exactAveragePrice(request.sells);

    return {
      stockCode: request.stockCode,
      stockName,
      firstBuyDate,
      lastSellDate,
      holdingDays: Math.round((toUtcDate(lastSellDate) - toUtcDate(firstBuyDate)) / DAY_MS),
      buyQuantity,
      sellQuantity,
      remainingQuantity: buyQuantity - sellQuantity,
      averageBuyPrice: Math.round(averageBuy),
      averageSellPrice: Math.round(averageSell),
      // 판 수량만큼의 손익입니다. 남은 수량은 아직 확정되지 않았으므로 넣지 않습니다.
      realizedProfit: Math.round((averageSell - averageBuy) * sellQuantity),
      returnPercent: Number(((averageSell / averageBuy - 1) * 100).toFixed(2)),
    };
  }

  // ==================== 자료 수집: 보유 기간의 공시, 공시일 시세, 시장 지수, 기사 모으기 ====================

  /** 공시는 복기를 풍부하게 할 뿐 필수가 아니어서, 실패하면 공시 없이 진행합니다. */
  private async loadDisclosures(metrics: TradeReviewMetrics): Promise<DartDisclosure[]> {
    if (!this.dartClient.isConfigured()) return [];

    try {
      const corpCode = await this.dartClient.findCorpCode(metrics.stockCode);
      if (!corpCode) return [];

      return await this.dartClient.getDisclosuresBetween(corpCode, metrics.firstBuyDate, metrics.lastSellDate, {
        limit: MAX_REVIEW_DISCLOSURES,
        excerptLength: REVIEW_DISCLOSURE_EXCERPT_LENGTH,
        noisePattern: REVIEW_NOISE_PATTERN,
        priority: rankReviewDisclosure,
      });
    } catch (error) {
      this.logger.warn(`공시 조회 실패, 공시 없이 진행합니다 (${metrics.stockCode})`, error);
      return [];
    }
  }

  /** 공시 뒤 주가 흐름을 볼 수 있도록 공시일 시세를 더합니다. 휴장일 접수처럼 시세가 없는 날은 건너뜁니다. */
  private async addDisclosureDayPrices(
    stockCode: string,
    tradeDayPrices: Map<string, DailyPrice>,
    disclosures: DartDisclosure[],
  ): Promise<Map<string, DailyPrice>> {
    const pricesByDate = new Map(tradeDayPrices);
    const disclosureDates = disclosures
      .map((disclosure) => disclosure.receivedDate.replaceAll('-', ''))
      .filter((date) => !pricesByDate.has(date));

    for (const date of new Set(disclosureDates)) {
      try {
        pricesByDate.set(date, await this.dailyPriceService.getDailyPrice(stockCode, date));
      } catch {
        this.logger.debug(`공시일 시세 없음 (${stockCode}, ${date})`);
      }
    }

    return new Map([...pricesByDate].sort(([a], [b]) => a.localeCompare(b)));
  }

  /** 같은 기간 시장 흐름과 비교하려고 지수 종가를 가져옵니다. 받지 못하면 시장 비교 없이 진행합니다. */
  private async loadMarketIndex(metrics: TradeReviewMetrics): Promise<MarketIndexCloses | null> {
    if (!this.krxIndexClient.isConfigured()) return null;

    try {
      const [from, to] = await Promise.all([
        this.krxIndexClient.getClose(MARKET_INDEX_NAME, metrics.firstBuyDate),
        this.krxIndexClient.getClose(MARKET_INDEX_NAME, metrics.lastSellDate),
      ]);
      return from && to ? { indexName: MARKET_INDEX_NAME, from, to } : null;
    } catch (error) {
      this.logger.warn(`시장 지수 조회 실패, 시장 비교 없이 진행합니다 (${metrics.stockCode})`, error);
      return null;
    }
  }

  /** 공시가 알려주지 않는 배경(왜 실적이 늘었는지 등)을 같은 기간 기사에서 찾습니다. 받지 못하면 기사 없이 진행합니다. */
  private async loadNews(metrics: TradeReviewMetrics, disclosures: DartDisclosure[]): Promise<NewsArticle[]> {
    if (!this.naverNewsClient.isConfigured()) return [];

    const keywords = NEWS_KEYWORDS_BY_DISCLOSURE.filter(([pattern]) =>
      disclosures.some((disclosure) => pattern.test(disclosure.title)),
    ).flatMap(([, words]) => words.map((word) => `${metrics.stockName} ${word}`));
    const queries = [...keywords, `${metrics.stockName} 주가`, metrics.stockName];

    try {
      return await this.naverNewsClient.searchNewsBetween(
        metrics.stockName,
        queries,
        formatDate(metrics.firstBuyDate),
        formatDate(metrics.lastSellDate),
        MAX_REVIEW_NEWS,
      );
    } catch (error) {
      this.logger.warn(`기사 검색 실패, 기사 없이 진행합니다 (${metrics.stockCode})`, error);
      return [];
    }
  }

  // ==================== 생성: AI에 복기를 요청하고 형식 확인하기 ====================

  private async generate(context: ReviewContext): Promise<ReviewOutput> {
    const prompt = buildReviewPrompt(context);

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
      try {
        const { text, model } = await this.geminiClient.generateJson({
          systemInstruction: REVIEW_SYSTEM_PROMPT,
          prompt,
          responseSchema: GEMINI_REVIEW_SCHEMA,
        });
        const output = parseReviewOutput(text);
        const forbidden = findForbiddenPhrase(output);

        if (!forbidden) {
          this.logger.log(`거래 복기 생성 완료 (${context.metrics.stockCode}, ${model}, ${attempt}회차)`);
          return output;
        }
        this.logger.warn(`금지 표현 "${forbidden}" 발견, 다시 생성합니다 (${attempt}회차)`);
      } catch (error) {
        this.logger.warn(`거래 복기 생성 실패 (${attempt}회차)`, error);
      }
    }

    throw new ServiceUnavailableException('AI 분석을 만들지 못했어요. 잠시 후 다시 시도해주세요.');
  }

  // ==================== 정리: AI가 단 출처를 실제 자료와 맞추기 ====================

  /** AI가 단 출처 ID 중 실제로 제공한 것만 남기고, 출처가 하나도 없는 "확인된 사실"은 버립니다. */
  private attachSources(
    output: ReviewOutput,
    metrics: TradeReviewMetrics,
    disclosures: DartDisclosure[],
    news: NewsArticle[],
    hasMarketIndex: boolean,
  ): Pick<TradeReview, 'confirmedFacts' | 'possibleFactors' | 'sources'> {
    const available: TradeReviewSource[] = [
      { sourceId: 'trade', title: '내가 남긴 거래 기록', date: metrics.lastSellDate, url: null },
      { sourceId: 'metrics', title: '밑줄이 계산한 손익·보유 기간', date: metrics.lastSellDate, url: null },
      { sourceId: 'krx', title: 'KRX 일별 시세', date: metrics.lastSellDate, url: null },
      ...(hasMarketIndex
        ? [{ sourceId: 'market', title: `${MARKET_INDEX_NAME} 지수 기간 변화`, date: metrics.lastSellDate, url: null }]
        : []),
      ...disclosures.map((disclosure) => ({
        sourceId: `dart:${disclosure.id}`,
        title: disclosure.title,
        date: disclosure.receivedDate.replaceAll('-', ''),
        url: disclosure.url,
      })),
      ...news.map((article) => ({
        sourceId: `news:${article.id}`,
        title: `[기사] ${article.title}`,
        date: article.publishedDate.replaceAll('-', ''),
        url: article.url,
      })),
    ];
    const knownIds = new Set(available.map((source) => source.sourceId));
    const keepKnown = (ids: string[]) => ids.filter((id) => knownIds.has(id));

    const confirmedFacts = output.confirmedFacts
      .map((fact) => ({ ...fact, sourceIds: keepKnown(fact.sourceIds) }))
      .filter((fact) => fact.sourceIds.length > 0);
    const possibleFactors = output.possibleFactors.map((factor) => ({
      ...factor,
      sourceIds: keepKnown(factor.sourceIds),
    }));

    const usedIds = new Set([...confirmedFacts, ...possibleFactors].flatMap((item) => item.sourceIds));

    return {
      confirmedFacts,
      possibleFactors,
      sources: available.filter((source) => usedIds.has(source.sourceId)),
    };
  }
}
