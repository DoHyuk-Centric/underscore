import { popularStockSchema, type PopularStock } from "@underscore/shared";
import { http } from "../../../lib/http";

export async function getPopularSectors(
  signal?: AbortSignal,
): Promise<PopularStock[]> {
  const response = await http.get("/market-data/popular/sectors", {
    signal,
  });

  return popularStockSchema.array().parse(response.data);
}
