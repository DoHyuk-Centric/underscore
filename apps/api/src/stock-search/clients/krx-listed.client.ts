import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getYesterdayKstBasDt } from '../../common/utils/kst-date.util.js';

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
  async fetchListedInfo(): Promise<KrxListedInfoItem[]> {
    const response = await axios.get(KRX_API_URL, {
      params: {
        serviceKey: process.env.KRX_API_KEY ?? '',
        numOfRows: 5000,
        pageNo: 1,
        resultType: 'json',
        basDt: getYesterdayKstBasDt(),
      },
    });

    return response.data?.response?.body?.items?.item ?? [];
  }
}
