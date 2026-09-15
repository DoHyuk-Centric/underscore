import { popularStockSchema, type PopularStock } from "@underscore/shared";
import { http } from "../../../lib/http";

export async function getPopularStocks(
  signal?: AbortSignal,
): Promise<PopularStock[]> {
  const response = await http.get("/market-data/popular/stocks", {
    signal,
  });

  return popularStockSchema.array().parse(response.data);
}
