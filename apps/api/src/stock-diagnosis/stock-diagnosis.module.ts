import { Module } from '@nestjs/common';
import { PopularSectorsModule } from '../popular-sectors/popular-sectors.module.js';
import { DartClient } from './dart.client.js';
import { GeminiClient } from './gemini.client.js';
import { NaverNewsClient } from './naver-news.client.js';
import { StockDiagnosisController } from './stock-diagnosis.controller.js';
import { StockDiagnosisService } from './stock-diagnosis.service.js';

@Module({
  imports: [PopularSectorsModule],
  controllers: [StockDiagnosisController],
  providers: [StockDiagnosisService, NaverNewsClient, GeminiClient, DartClient],
  // 거래 복기(TradeReviewModule)도 같은 Gemini·DART·뉴스 연결을 씁니다. DART 고유번호 캐시를 한 번만 받도록 인스턴스를 공유합니다.
  exports: [GeminiClient, DartClient, NaverNewsClient],
})
export class StockDiagnosisModule {}
