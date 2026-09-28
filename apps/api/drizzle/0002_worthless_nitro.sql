CREATE TABLE "stock_diagnosis" (
	"stock_code" varchar(12) NOT NULL,
	"base_date" date NOT NULL,
	"stock_name" varchar(100) NOT NULL,
	"rank" integer NOT NULL,
	"headline" text NOT NULL,
	"company_intro" text,
	"impact_context" text,
	"market_context" jsonb NOT NULL,
	"news" jsonb NOT NULL,
	"caution" text NOT NULL,
	"model" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stock_diagnosis_stock_code_base_date_pk" PRIMARY KEY("stock_code","base_date")
);
