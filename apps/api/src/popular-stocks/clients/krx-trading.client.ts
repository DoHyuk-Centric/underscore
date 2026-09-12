import { Injectable } from '@nestjs/common';
import axios from 'axios';

const KRX_API_BASE_URL = 'https://data-dbg.krx.co.kr/svc/apis/sto';

@Injectable()
export class KrxTradingClient {
  private async fetchDailyTrade(endpoint: string, baseDate: string) {
    const response = await axios.get(`${KRX_API_BASE_URL}/${endpoint}`, {
      params: { basDd: baseDate },
      headers: { AUTH_KEY: process.env.KRX_OPEN_API_KEY ?? '' },
    });
    return response.data?.OutBlock_1 ?? [];
  }

  async fetchAllDailyTrade(baseDate: string) {
    const [kospi, kosdaq] = await Promise.all([
      this.fetchDailyTrade('stk_bydd_trd', baseDate),
      this.fetchDailyTrade('ksq_bydd_trd', baseDate),
    ]);
    return [...kospi, ...kosdaq];
  }
}
