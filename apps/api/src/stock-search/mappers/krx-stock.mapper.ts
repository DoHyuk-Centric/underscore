import { Injectable } from '@nestjs/common';
import { KRXStock, stockSchema } from '@underscore/shared';
import type { KrxListedInfoItem } from '../clients/krx-listed.client.js';

@Injectable()
export class KrxStockMapper {
  toStocks(items: KrxListedInfoItem[]): KRXStock[] {
    return items
      .map((item) =>
        stockSchema.safeParse({
          stockCode: item.srtnCd,
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
