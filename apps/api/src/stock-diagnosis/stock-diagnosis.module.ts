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
})
export class StockDiagnosisModule {}
