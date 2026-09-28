CREATE TABLE "daily_price" (
	"stock_code" varchar(12) NOT NULL,
	"date" date NOT NULL,
	"open" integer NOT NULL,
	"high" integer NOT NULL,
	"low" integer NOT NULL,
	"close" integer NOT NULL,
	"volume" bigint NOT NULL,
	"trading_value" bigint NOT NULL,
	CONSTRAINT "daily_price_stock_code_date_pk" PRIMARY KEY("stock_code","date")
);
