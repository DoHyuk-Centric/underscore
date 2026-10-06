import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { tradeReviewRequestSchema, type TradeReview } from '@underscore/shared';
import { TradeReviewService } from './trade-review.service.js';

@Controller('trade-review')
export class TradeReviewController {
  constructor(private readonly tradeReviewService: TradeReviewService) {}

  @Post()
  review(@Body() body: unknown): Promise<TradeReview> {
    // 화면과 같은 공유 스키마로 다시 검증합니다.
    const parsed = tradeReviewRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message ?? '입력값을 확인해주세요.');
    }

    return this.tradeReviewService.review(parsed.data);
  }
}
