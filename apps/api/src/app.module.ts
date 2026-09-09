import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { TradingModule } from './trading/trading.module.js';
import { PortfolioModule } from './portfolio/portfolio.module.js';
import { MarketDataModule } from './market-data/market-data.module.js';
import { PriceStreamModule } from './price-stream/price-stream.module.js';
import { DisclosureModule } from './disclosure/disclosure.module.js';
import { ReviewModule } from './review/review.module.js';

@Module({
  imports: [
    AuthModule,
    TradingModule,
    PortfolioModule,
    MarketDataModule,
    PriceStreamModule,
    DisclosureModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
