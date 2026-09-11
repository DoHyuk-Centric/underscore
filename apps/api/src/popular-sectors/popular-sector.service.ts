import { Injectable, Logger } from '@nestjs/common';
import { getYesterdayKstBasDt } from '../common/utils/kst-date.util.js';
import { KrxIndexClient } from './clients/krx-index.client.js';

@Injectable()
export class PopularSectorService {
  private readonly logger = new Logger(PopularSectorService.name);

  constructor(private readonly krxIndexClient: KrxIndexClient) {}

  async getPopularSectors() {
    const baseDate = getYesterdayKstBasDt();
    const items = await this.krxIndexClient.fetchDailyIndices(baseDate);

    const classifications = [
      ...new Set(items.map((item) => item.IDX_CLSS)),
    ];

    this.logger.debug(
      `KRX 지수 계열: ${JSON.stringify(classifications)}`,
    );

    console.log(items);
    return items;
  }
}