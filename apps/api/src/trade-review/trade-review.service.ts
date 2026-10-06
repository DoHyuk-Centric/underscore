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
import { buildReviewPrompt, REVIEW_SYSTEM_PROMPT } from './trade-review.prompt.js';
import {
  findForbiddenPhrase,
  GEMINI_REVIEW_SCHEMA,
  parseReviewOutput,
  type ReviewOutput,
} from './trade-review.schema.js';

const DAY_MS = 24 * 60 * 60 * 1000;
// 보유 기간이 길어도 프롬프트가 커지지 않도록 공시 건수와 발췌 길이를 제한합니다.
const MAX_REVIEW_DISCLOSURES = 4;
const REVIEW_DISCLOSURE_EXCERPT_LENGTH = 500;
// 형식 오류나 금지 표현이 나오면 한 번 더 생성합니다.
const MAX_GENERATION_ATTEMPTS = 2;

const sumQuantity = (entries: TradeEntry[]) => entries.reduce((total, entry) => total + entry.quantity, 0);

const exactAveragePrice = (entries: TradeEntry[]) =>
  entries.reduce((total, entry) => total + entry.price * entry.quantity, 0) / sumQuantity(entries);

const toUtcDate = (key: string) =>
  Date.UTC(Number(key.slice(0, 4)), Number(key.slice(4, 6)) - 1, Number(key.slice(6, 8)));

const formatDate = (key: string) => `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}`;

@Injectable()
export class TradeReviewService {
  private readonly logger = new Logger(TradeReviewService.name);

  constructor(
    private readonly dailyPriceService: DailyPriceService,
    private readonly dartClient: DartClient,
    private readonly geminiClient: GeminiClient,
  ) {}

  async review(request: TradeReviewRequest): Promise<TradeReview> {
    if (!this.geminiClient.isConfigured()) {
      throw new ServiceUnavailableException('AI 분석을 사용할 수 없어요.');
    }

    const dailyPrices = await this.verifyWithDailyPrices(request);
    const metrics = this.calculateMetrics(request, dailyPrices[0].name);
    const disclosures = await this.loadDisclosures(metrics);
    const output = await this.generate({ request, metrics, dailyPrices, disclosures });

    return { metrics, ...output, ...this.attachSources(output, metrics, disclosures) };
  }

  /** 화면에서 한 검증을 서버에서 다시 합니다. 화면을 거치지 않은 요청도 그날 시세로 가능한 거래만 받습니다. */
  private async verifyWithDailyPrices(request: TradeReviewRequest): Promise<DailyPrice[]> {
    const entries = [...request.buys, ...request.sells];
    const dates = [...new Set(entries.map((entry) => entry.date))].sort();

    const pricesByDate = new Map<string, DailyPrice>();
    for (const date of dates) {
      try {
        pricesByDate.set(date, await this.dailyPriceService.getDailyPrice(request.stockCode, date));
      } catch (error) {
        const reason = error instanceof HttpException ? error.message : '시세를 확인하지 못했어요.';
        throw new BadRequestException(`${formatDate(date)}: ${reason}`);
      }
    }

    for (const entry of entries) {
      const [issue] = getTradeEntryPriceIssues(entry, pricesByDate.get(entry.date)!);
      if (issue) throw new BadRequestException(`${formatDate(entry.date)}: ${issue.message}`);
    }

    return dates.map((date) => pricesByDate.get(date)!);
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

  /** 공시는 복기를 풍부하게 할 뿐 필수가 아니어서, 실패하면 공시 없이 진행합니다. */
  private async loadDisclosures(metrics: TradeReviewMetrics): Promise<DartDisclosure[]> {
    if (!this.dartClient.isConfigured()) return [];

    try {
      const corpCode = await this.dartClient.findCorpCode(metrics.stockCode);
      if (!corpCode) return [];

      return await this.dartClient.getDisclosuresBetween(corpCode, metrics.firstBuyDate, metrics.lastSellDate, {
        limit: MAX_REVIEW_DISCLOSURES,
        excerptLength: REVIEW_DISCLOSURE_EXCERPT_LENGTH,
      });
    } catch (error) {
      this.logger.warn(`공시 조회 실패, 공시 없이 진행합니다 (${metrics.stockCode})`, error);
      return [];
    }
  }

  private async generate(context: Parameters<typeof buildReviewPrompt>[0]): Promise<ReviewOutput> {
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

  /** AI가 단 출처 ID 중 실제로 제공한 것만 남기고, 출처가 하나도 없는 "확인된 사실"은 버립니다. */
  private attachSources(
    output: ReviewOutput,
    metrics: TradeReviewMetrics,
    disclosures: DartDisclosure[],
  ): Pick<TradeReview, 'confirmedFacts' | 'possibleFactors' | 'sources'> {
    const available: TradeReviewSource[] = [
      { sourceId: 'trade', title: '내가 남긴 거래 기록', date: metrics.lastSellDate, url: null },
      { sourceId: 'metrics', title: '밑줄이 계산한 손익·보유 기간', date: metrics.lastSellDate, url: null },
      { sourceId: 'krx', title: 'KRX 일별 시세', date: metrics.lastSellDate, url: null },
      ...disclosures.map((disclosure) => ({
        sourceId: `dart:${disclosure.id}`,
        title: disclosure.title,
        date: disclosure.receivedDate.replaceAll('-', ''),
        url: disclosure.url,
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
