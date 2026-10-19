import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { toNumber } from '../popular-stocks/mappers/krx-trading.mapper.js';

const KRX_INDEX_URL = 'https://data-dbg.krx.co.kr/svc/apis/idx/krx_dd_trd';
// 지난 날짜의 지수는 바뀌지 않으므로 날짜별 응답을 메모리에 보관합니다.
const MAX_CACHED_DATES = 60;

interface KrxIndexItem {
  IDX_NM?: string;
  CLSPRC_IDX?: string;
}

/** KRX 시리즈 지수(KRX 300 등)의 일별 종가. 코스피·코스닥 지수는 별도 이용 신청이 필요해 이 시리즈를 씁니다. */
@Injectable()
export class KrxIndexClient {
  private readonly closesByDate = new Map<string, Promise<Map<string, number>>>();

  isConfigured(): boolean {
    return Boolean(process.env.KRX_OPEN_API_KEY);
  }

  /** 그날 지수 종가. 휴장일이거나 지수가 없으면 null입니다. */
  async getClose(indexName: string, date: string): Promise<number | null> {
    const closes = await this.loadCloses(date);
    return closes.get(indexName) ?? null;
  }

  private loadCloses(date: string) {
    const cached = this.closesByDate.get(date);
    if (cached) return cached;

    const pending = axios
      .get<{ OutBlock_1?: KrxIndexItem[] }>(KRX_INDEX_URL, {
        params: { basDd: date },
        headers: { AUTH_KEY: process.env.KRX_OPEN_API_KEY ?? '' },
        timeout: 15_000,
      })
      .then(({ data }) => new Map((data.OutBlock_1 ?? []).map((item) => [item.IDX_NM ?? '', toNumber(item.CLSPRC_IDX)])));

    pending.catch(() => this.closesByDate.delete(date));

    if (this.closesByDate.size >= MAX_CACHED_DATES) {
      const oldestDate = this.closesByDate.keys().next().value;
      if (oldestDate) this.closesByDate.delete(oldestDate);
    }
    this.closesByDate.set(date, pending);

    return pending;
  }
}
