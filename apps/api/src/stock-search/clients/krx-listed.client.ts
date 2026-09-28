import { Injectable } from '@nestjs/common';
import axios from 'axios';

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

@Injectable()
export class KrxListedClient {
  async fetchListedInfo(baseDate: string): Promise<KrxListedInfoItem[]> {
    const response = await axios.get(KRX_API_URL, {
      params: {
        serviceKey: process.env.KRX_API_KEY ?? '',
        numOfRows: 5000,
        pageNo: 1,
        resultType: 'json',
        basDt: baseDate,
      },
    });

    return response.data?.response?.body?.items?.item ?? [];
  }
}
