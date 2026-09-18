import { sectorStockSchema, type SectorStock } from "@underscore/shared";
import { http } from "../../../lib/http";

export async function getSectorStocks(
  sectorName: string,
  signal?: AbortSignal,
): Promise<SectorStock[]> {
  const response = await http.get(
    `/market-data/popular/sectors/${encodeURIComponent(sectorName)}/stocks`,
    { signal },
  );

  return sectorStockSchema.array().parse(response.data);
}
