import { z } from "zod";

export const MIN_TRADE_REASON_LENGTH = 10;
export const MAX_TRADE_REASON_LENGTH = 300;

// 날짜는 KRX baseDate와 같은 YYYYMMDD 문자열로 주고받습니다.
const tradeDateSchema = z
  .string({ required_error: "날짜를 골라주세요." })
  .regex(/^\d{8}$/, "날짜를 골라주세요.");

const positiveIntegerSchema = (label: string) =>
  z
    .number({ required_error: `${label}을 입력해주세요.`, invalid_type_error: `${label}을 입력해주세요.` })
    .int()
    .positive(`${label}은 0보다 커야 해요.`);

const reasonTooShortMessage = `${MIN_TRADE_REASON_LENGTH}자 이상 적어주세요.`;

const tradeEntryBaseSchema = z.object({
  date: tradeDateSchema,
  price: positiveIntegerSchema("가격"),
  quantity: positiveIntegerSchema("수량"),
});

// 첫 건의 근거는 필수이고, 이후 분할 건의 근거는 적었을 때만 길이를 검사합니다.
export const tradeEntrySchema = tradeEntryBaseSchema.extend({
  reason: z.string().trim().max(MAX_TRADE_REASON_LENGTH),
});

const firstTradeEntrySchema = tradeEntryBaseSchema.extend({
  reason: z.string().trim().min(MIN_TRADE_REASON_LENGTH, reasonTooShortMessage).max(MAX_TRADE_REASON_LENGTH),
});

const additionalTradeEntrySchema = tradeEntryBaseSchema.extend({
  reason: z
    .string()
    .trim()
    .max(MAX_TRADE_REASON_LENGTH)
    .refine((reason) => reason.length === 0 || reason.length >= MIN_TRADE_REASON_LENGTH, reasonTooShortMessage),
});

const tradeEntriesSchema = z.tuple([firstTradeEntrySchema]).rest(additionalTradeEntrySchema);

export const tradeReviewRequestSchema = z
  .object({
    stockCode: z.string({ required_error: "종목을 골라주세요." }).min(1, "종목을 골라주세요."),
    buys: tradeEntriesSchema,
    sells: tradeEntriesSchema,
  })
  .superRefine(({ buys, sells }, ctx) => {
    // 같은 날에는 매수가 먼저 체결됐다고 보고, 매도 시점마다 보유 수량이 음수가 되지 않는지 확인합니다.
    const events = [
      ...buys.map((entry) => ({ ...entry, delta: entry.quantity, sellIndex: -1 })),
      ...sells.map((entry, index) => ({ ...entry, delta: -entry.quantity, sellIndex: index })),
    ].sort((a, b) => a.date.localeCompare(b.date) || b.delta - a.delta);

    let holding = 0;
    for (const event of events) {
      holding += event.delta;
      if (holding < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sells", event.sellIndex, "quantity"],
          message: "이 시점에 보유한 수량보다 많이 팔 수 없어요.",
        });
        return;
      }
    }
  });

export type TradeEntry = z.infer<typeof tradeEntrySchema>;
export type TradeReviewRequest = z.infer<typeof tradeReviewRequestSchema>;
