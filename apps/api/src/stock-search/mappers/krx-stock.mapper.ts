import { Injectable } from '@nestjs/common';
import { KRXStock, stockSchema } from '@underscore/shared';
import type { KrxListedInfoItem } from '../clients/krx-listed.client.js';

@Injectable()
export class KrxStockMapper {
  toStocks(items: KrxListedInfoItem[]): KRXStock[] {
    return items
      .map((item) =>
        stockSchema.safeParse({
          // 공공데이터포털은 'A005930'처럼 접두사를 붙여 주므로, KRX 시세·인기 종목과 같은 6자리로 맞춥니다.
          stockCode: item.srtnCd?.replace(/^A/, ''),
          isinCode: item.isinCd,
          name: item.itmsNm,
          market: item.mrktCtg,
          corpName: item.corpNm,
          corpRegistrationNo: item.crno,
          baseDate: item.basDt,
        }),
      )
      .filter((result): result is { success: true; data: KRXStock } => result.success)
      .map((result) => result.data);
  }
}
