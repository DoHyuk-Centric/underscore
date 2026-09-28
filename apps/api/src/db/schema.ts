import {
  date,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export interface DiagnosisNewsLink {
  title: string;
  url: string;
}

/** 급등 종목의 기준일별 AI 진단 */
export const stockDiagnosis = pgTable(
  'stock_diagnosis',
  {
    stockCode: varchar('stock_code', { length: 12 }).notNull(),
    baseDate: date('base_date').notNull(),
    stockName: varchar('stock_name', { length: 100 }).notNull(),
    rank: integer('rank').notNull(),
    headline: text('headline').notNull(),
    companyIntro: text('company_intro'),
    impactContext: text('impact_context'),
    marketContext: jsonb('market_context').$type<string[]>().notNull(),
    news: jsonb('news').$type<DiagnosisNewsLink[]>().notNull(),
    caution: text('caution').notNull(),
    model: varchar('model', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.stockCode, table.baseDate] })],
);

export type StockDiagnosisRow = typeof stockDiagnosis.$inferSelect;
export type NewStockDiagnosisRow = typeof stockDiagnosis.$inferInsert;
