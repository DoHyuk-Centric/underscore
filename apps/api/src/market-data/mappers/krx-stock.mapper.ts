import { Injectable } from '@nestjs/common';
import { KRXStock, stockSchema } from '@underscore/shared';
import type { KrxListedInfoItem } from '../clients/krx-api.client.js';

@Injectable()
export class KrxStockMapper {
  toStock(item: KrxListedInfoItem): KRXStock | null {
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

  toStocks(items: KrxListedInfoItem[]): KRXStock[] {
    return items
      .map((item) => this.toStock(item))
      .filter((stock): stock is KRXStock => stock !== null);
  }
}
