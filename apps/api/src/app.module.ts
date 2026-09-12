import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { StockSearchModule } from './stock-search/stock-search.module.js';
import { PopularStocksModule } from './popular-stocks/popular-stocks.module.js';
import { PopularSectorsModule } from './popular-sectors/popular-sectors.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    StockSearchModule,
    PopularStocksModule,
    PopularSectorsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
