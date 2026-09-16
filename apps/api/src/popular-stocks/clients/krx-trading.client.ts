import { Injectable } from '@nestjs/common';
import axios from 'axios';
import type { KrxTradingItem } from '../mappers/krx-trading.mapper.js';

const KRX_API_BASE_URL = 'https://data-dbg.krx.co.kr/svc/apis/sto';

@Injectable()
export class KrxTradingClient {
  private async fetchDailyTrade(endpoint: string, baseDate: string) {
    const apiKey = process.env.KRX_OPEN_API_KEY;

    if (!apiKey) {
      throw new Error(`KRX_OPEN_API_KEY가 설정되지 않았습니다.`);
    }

    const response = await axios.get(`${KRX_API_BASE_URL}/${endpoint}`, {
      params: { basDd: baseDate },
      headers: { AUTH_KEY: process.env.KRX_OPEN_API_KEY ?? '' },
      timeout: 5_000,
    });

    const items: unknown = response.data?.OutBlock_1;

    if (!Array.isArray(items)) {
      throw new Error(`KRX 응답 형식이 올바르지 않습니다: ${endpoint}`);
    }

    return items as KrxTradingItem[];
  }

  async fetchAllDailyTrade(baseDate: string) {
    const [kospi, kosdaq] = await Promise.all([
      this.fetchDailyTrade('stk_bydd_trd', baseDate),
      this.fetchDailyTrade('ksq_bydd_trd', baseDate),
    ]);
    return [...kospi, ...kosdaq];
  }
}
