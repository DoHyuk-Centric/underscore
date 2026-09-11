import { Injectable } from '@nestjs/common';
import axios from 'axios';

const KRX_INDEX_API_URL =
  'https://data-dbg.krx.co.kr/svc/apis/idx/krx_dd_trd';

/**
 * KRX 시리즈 일별시세정보 응답 항목
 *
 * KRX API는 가격, 등락률, 거래대금 등의 숫자도 문자열로 반환한다.
 */
export type KrxIndexItem = {
  BAS_DD?: string; // 기준일자
  IDX_CLSS?: string; // 계열구분
  IDX_NM?: string; // 지수명
  CLSPRC_IDX?: string; // 종가
  CMPPREVDD_IDX?: string; // 전일 대비
  FLUC_RT?: string; // 등락률
  OPNPRC_IDX?: string; // 시가
  HGPRC_IDX?: string; // 고가
  LWPRC_IDX?: string; // 저가
  ACC_TRDVOL?: string; // 거래량
  ACC_TRDVAL?: string; // 거래대금
  MKTCAP?: string; // 상장시가총액
};

type KrxIndexResponse = {
  OutBlock_1?: KrxIndexItem[];
};

@Injectable()
export class KrxIndexClient {
  async fetchDailyIndices(baseDate: string): Promise<KrxIndexItem[]> {
    const response = await axios.get<KrxIndexResponse>(KRX_INDEX_API_URL, {
      params: {
        basDd: baseDate,
      },
      headers: {
        AUTH_KEY: process.env.KRX_OPEN_API_KEY ?? '',
      },
    });

    return response.data.OutBlock_1 ?? [];
  }
}