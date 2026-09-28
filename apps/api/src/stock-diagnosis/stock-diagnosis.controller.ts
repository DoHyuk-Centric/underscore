import { Controller, Get } from '@nestjs/common';
import { StockDiagnosisService } from './stock-diagnosis.service.js';

@Controller('market-data/popular')
export class StockDiagnosisController {
  constructor(private readonly stockDiagnosisService: StockDiagnosisService) {}

  @Get('diagnoses')
  getDiagnoses() {
    return this.stockDiagnosisService.getDiagnoses();
  }
}
