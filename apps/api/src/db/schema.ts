import { bigint, date, integer, pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core';

export const dailyPrice = pgTable(
  'daily_price',
  {
    stockCode: varchar('stock_code', { length: 12 }).notNull(),
    date: date('date', { mode: 'string' }).notNull(),
    open: integer('open').notNull(),
    high: integer('high').notNull(),
    low: integer('low').notNull(),
    close: integer('close').notNull(),
    volume: bigint('volume', { mode: 'number' }).notNull(),
    tradingValue: bigint('trading_value', { mode: 'number' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.stockCode, table.date] })],
);

export type DailyPrice = typeof dailyPrice.$inferSelect;
export type NewDailyPrice = typeof dailyPrice.$inferInsert;
