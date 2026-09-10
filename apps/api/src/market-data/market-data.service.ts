import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { KRXStock, stockSchema } from '@underscore/shared';
import { Cron, CronExpression } from '@nestjs/schedule';

const KRX_API_URL =
  'https://apis.data.go.kr/1160100/GetKrxListedInfoService_V2/getItemInfo';

interface KrxListedInfoItem {
  basDt?: string;
  srtnCd?: string;
  isinCd?: string;
  mrktCtg?: string;
  itmsNm?: string;
  crno?: string;
  corpNm?: string;
}

@Injectable()
export class MarketDataService implements OnModuleInit {
  private readonly logger = new Logger(MarketDataService.name);
  private stocks: KRXStock[] = [];

  async onModuleInit() {
    await this.fetchAndCache();
  }

  private async fetchAndCache() {
    try {
      const url = new URL(KRX_API_URL);
      url.searchParams.set('serviceKey', process.env.KRX_API_KEY ?? '');
      url.searchParams.set('numOfRows', '3000');
      url.searchParams.set('pageNo', '1');
      url.searchParams.set('resultType', 'json');

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`KRX API 응답: ${res.status}`);
      }

      const body = await res.json();
      const items: KrxListedInfoItem[] = body?.response?.body?.items?.item ?? [];

      const stocks = items
        .map((item) => this.mapToStock(item))
        .filter((stock): stock is KRXStock => stock !== null);

      if (stocks.length === 0) {
        throw new Error('응답에서 파싱된 종목이 없어요');
      }
      this.stocks = stocks;
      this.logger.log(`종목 ${stocks.length}건 캐싱 완료`);
    } catch (error) {
      this.logger.error('종목 목록 갱신 실패, 기존 캐시를 유지합니다.', error);
    }
  }

  private mapToStock(item: KrxListedInfoItem): KRXStock | null {
    const parsed = stockSchema.safeParse({
      stockCode: item.srtnCd,
      isinCode: item.isinCd,
      name: item.itmsNm,
      market: item.mrktCtg,
      corpName: item.corpNm,
      corpRegistrationNo: item.crno,
      baseDate: item.basDt,
    });
    return parsed.success ? parsed.data : null;
  }

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  async handleDailyRefresh() {
    await this.fetchAndCache();
  }

  search(query: string): KRXStock[] {
    const normalized = query.trim().toLowerCase().replace(/\s+/g, '');
    if (!normalized) return [];
    return this.stocks.filter((stock) =>
      stock.name.toLowerCase().replace(/\s+/g, '').includes(normalized),
    );
  }
}
