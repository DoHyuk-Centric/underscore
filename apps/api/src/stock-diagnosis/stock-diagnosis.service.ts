import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { PopularStock, StockDiagnosis } from '@underscore/shared';
import { desc, eq } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDb } from '../db/drizzle.module.js';
import { stockDiagnosis, type NewStockDiagnosisRow } from '../db/schema.js';
import { PopularSectorService } from '../popular-sectors/popular-sector.service.js';
import { DartClient } from './dart.client.js';
import {
  DIAGNOSIS_SYSTEM_PROMPT,
  buildDiagnosisPrompt,
  type DiagnosisContext,
} from './diagnosis.prompt.js';
import {
  GEMINI_RESPONSE_SCHEMA,
  findForbiddenPhrase,
  parseDiagnosisOutput,
  type DiagnosisOutput,
} from './diagnosis.schema.js';
import { GeminiClient } from './gemini.client.js';
import { NaverNewsClient } from './naver-news.client.js';

const DIAGNOSIS_LIMIT = 10;
const MAX_GENERATE_ATTEMPTS = 3;

@Injectable()
export class StockDiagnosisService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StockDiagnosisService.name);
  private running = false;
  protected retryDelayMs = 3_000;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDb,
    private readonly popularSectorService: PopularSectorService,
    private readonly naverNewsClient: NaverNewsClient,
    private readonly geminiClient: GeminiClient,
    private readonly dartClient: DartClient,
  ) {}

  onApplicationBootstrap(): void {
    // 서버 시작을 막지 않도록 백그라운드에서 실행합니다. 이미 저장된 종목은 건너뜁니다.
    void this.generateDiagnoses();
  }

  // 급등 종목 캐시가 갱신되는 오후 2시 이후에 실행합니다.
  @Cron('0 10 14 * * *', { timeZone: 'Asia/Seoul' })
  async generateDailyDiagnoses(): Promise<void> {
    await this.generateDiagnoses();
  }

  /** 급등 상위 종목 중 아직 진단이 없는 종목의 AI 진단을 생성해 저장합니다. */
  async generateDiagnoses(): Promise<void> {
    if (this.running) return;

    if (!this.naverNewsClient.isConfigured()) {
      this.logger.warn(
        'NAVER_API_HUB_CLIENT_ID/NAVER_API_HUB_CLIENT_SECRET이 없어 뉴스 검색을 할수 없습니다.',
      );
      return;
    }
    if (!this.geminiClient.isConfigured()) {
      this.logger.warn(`GEMINI_API_KEY가 없어 AI 진단을 생성할 수 없습니다.`);
      return;
    }

    this.running = true;

    try {
      const { baseDate, stocks } =
        await this.popularSectorService.getPopularSectorSnapshot();
      const dbDate = toDbDate(baseDate);
      const saved = await this.db
        .select({ stockCode: stockDiagnosis.stockCode })
        .from(stockDiagnosis)
        .where(eq(stockDiagnosis.baseDate, dbDate));
      const savedCodes = new Set(saved.map((row) => row.stockCode));
      const targets = stocks
        .slice(0, DIAGNOSIS_LIMIT)
        .filter((stock) => !savedCodes.has(stock.stockCode));

      if (targets.length === 0) {
        this.logger.log(`AI 진단이 이미 모두 저장되어 있습니다 (${baseDate})`);
        return;
      }

      let succeeded = 0;

      // 호출 한도와 비용을 고려해 종목을 하나씩 순서대로 처리합니다.
      for (const stock of targets) {
        try {
          await this.diagnoseAndSave(stock, baseDate);
          succeeded += 1;
        } catch (error) {
          this.logger.error(
            `${stock.name}(${stock.stockCode}) AI 진단 생성 실패`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      this.logger.log(
        `AI 진단 ${succeeded}/${targets.length}건 저장 완료 (${baseDate})`,
      );
    } catch (error) {
      this.logger.error(
        'AI 진단 생성 실패',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }

  /** 가장 최근 기준일의 AI 진단을 순위순으로 반환합니다. 아직 생성 전이면 빈 배열입니다. */
  async getDiagnoses(): Promise<StockDiagnosis[]> {
    const [latest] = await this.db
      .select({ baseDate: stockDiagnosis.baseDate })
      .from(stockDiagnosis)
      .orderBy(desc(stockDiagnosis.baseDate))
      .limit(1);

    if (!latest) return [];

    const rows = await this.db
      .select()
      .from(stockDiagnosis)
      .where(eq(stockDiagnosis.baseDate, latest.baseDate))
      .orderBy(stockDiagnosis.rank);

    return rows.map((row) => ({
      rank: row.rank,
      stockCode: row.stockCode,
      stockName: row.stockName,
      headline: row.headline,
      companyIntro: row.companyIntro,
      impactContext: row.impactContext,
      marketContext: row.marketContext,
      news: row.news,
      caution: row.caution,
    }));
  }

  private async diagnoseAndSave(
    stock: PopularStock,
    baseDate: string,
  ): Promise<void> {
    const [articles, dart] = await Promise.all([
      this.naverNewsClient.searchStockNews(stock.name, baseDate),
      this.loadDartContext(stock, baseDate),
    ]);
    const context: DiagnosisContext = { articles, ...dart };
    const { output, model } = await this.generate(stock, baseDate, context);

    // 링크는 AI가 쓴 URL이 아니라, 실제로 조회된 공시·기사 중 AI가 근거로 고른 것만 사용합니다.
    const disclosuresById = new Map(dart.disclosures.map((d) => [d.id, d]));
    const articlesById = new Map(articles.map((a) => [a.id, a]));
    const news = [
      ...[...new Set(output.disclosureIds)].flatMap((id) => {
        const disclosure = disclosuresById.get(id);
        return disclosure
          ? [{ title: `[공시] ${disclosure.title}`, url: disclosure.url }]
          : [];
      }),
      ...[...new Set(output.newsIds)].flatMap((id) => {
        const article = articlesById.get(id);
        return article ? [{ title: article.title, url: article.url }] : [];
      }),
    ];

    const row: NewStockDiagnosisRow = {
      stockCode: stock.stockCode,
      baseDate: toDbDate(baseDate),
      stockName: stock.name,
      rank: stock.rank,
      headline: output.headline,
      companyIntro: output.companyIntro,
      impactContext: output.impactContext,
      marketContext: output.marketContext,
      news,
      caution: output.caution,
      model,
    };

    await this.db
      .insert(stockDiagnosis)
      .values(row)
      .onConflictDoUpdate({
        target: [stockDiagnosis.stockCode, stockDiagnosis.baseDate],
        set: { ...row, createdAt: new Date() },
      });
  }

  /** DART 회사 개요와 기준일 전후 공시. DART가 없거나 실패해도 뉴스만으로 진단할 수 있게 빈 값을 돌려줍니다. */
  private async loadDartContext(
    stock: PopularStock,
    baseDate: string,
  ): Promise<Pick<DiagnosisContext, 'company' | 'disclosures'>> {
    const empty = { company: null, disclosures: [] };

    if (!this.dartClient.isConfigured()) return empty;

    try {
      const corpCode = await this.dartClient.findCorpCode(stock.stockCode);
      if (!corpCode) return empty;

      const [company, disclosures] = await Promise.all([
        this.dartClient.getCompanyProfile(corpCode),
        this.dartClient.getRecentDisclosures(corpCode, baseDate),
      ]);

      return { company, disclosures };
    } catch (error) {
      this.logger.warn(
        `${stock.name} DART 조회 실패, 뉴스만으로 진단합니다: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return empty;
    }
  }

  private async generate(
    stock: PopularStock,
    baseDate: string,
    context: DiagnosisContext,
  ): Promise<{ output: DiagnosisOutput; model: string }> {
    const prompt = buildDiagnosisPrompt(stock, baseDate, context);
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_GENERATE_ATTEMPTS; attempt++) {
      try {
        const { text, model } = await this.geminiClient.generateJson({
          systemInstruction: DIAGNOSIS_SYSTEM_PROMPT,
          prompt,
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        });
        const output = parseDiagnosisOutput(text);
        const forbidden = findForbiddenPhrase(output);

        if (forbidden) {
          throw new Error(`금지 표현이 포함되어 있습니다: ${forbidden}`);
        }

        return { output, model };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `${stock.name} AI 진단 생성 실패 (${attempt}/${MAX_GENERATE_ATTEMPTS}): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        // 일시적인 과부하(503)나 한도 초과(429)에 대비해 재시도 전에 잠시 기다립니다.
        if (attempt < MAX_GENERATE_ATTEMPTS) {
          await sleep(this.retryDelayMs * attempt);
        }
      }
    }

    throw lastError;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDbDate(baseDate: string): string {
  return `${baseDate.slice(0, 4)}-${baseDate.slice(4, 6)}-${baseDate.slice(6, 8)}`;
}
