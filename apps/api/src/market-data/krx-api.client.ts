import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getYesterdayKstBasDt } from './kst-date.util.js';

const KRX_API_URL =
  'https://apis.data.go.kr/1160100/GetKrxListedInfoService_V2/getItemInfo_V2';

export interface KrxListedInfoItem {
  basDt?: string;
  srtnCd?: string;
  isinCd?: string;
  mrktCtg?: string;
  itmsNm?: string;
  crno?: string;
  corpNm?: string;
}

const PAGE_SIZE = 5000;
const MAX_PAGES = 2;

@Injectable()
export class KrxApiClient {
  private async request(basDt: string, numOfRows: number, pageNo: number) {
    const params: Record<string, string | number> = {
      serviceKey: process.env.KRX_API_KEY ?? '',
      numOfRows,
      pageNo,
      resultType: 'json',
    };
    if (basDt) {
      params.basDt = basDt;
    }

    const res = await axios.get(KRX_API_URL, { params });
    return res.data;
  }

  async fetchListedInfo(): Promise<KrxListedInfoItem[]> {
    const basDt = getYesterdayKstBasDt();

    const countBody = await this.request(basDt, 1, 1);
    const totalCount = countBody?.response?.body?.totalCount ?? 0;
    if (totalCount === 0) {
      return [];
    }

    const items: KrxListedInfoItem[] = [];
    for (let pageNo = 1; items.length < totalCount; pageNo++) {
      if (pageNo > MAX_PAGES) {
        throw new Error(
          `KRX API totalCount(${totalCount})가 비정상적으로 커요. basDt 필터링이 제대로 안 됐을 수 있어요.`,
        );
      }

      const body = await this.request(basDt, PAGE_SIZE, pageNo);
      const pageItems: KrxListedInfoItem[] = body?.response?.body?.items?.item ?? [];
      if (pageItems.length === 0) {
        break;
      }
      items.push(...pageItems);
    }

    return items;
  }
}
