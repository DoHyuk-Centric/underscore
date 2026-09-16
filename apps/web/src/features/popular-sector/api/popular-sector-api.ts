import { popularSectorSchema, type PopularSector } from "@underscore/shared";
import { http } from "../../../lib/http";

export async function getPopularSectors(
  signal?: AbortSignal,
): Promise<PopularSector[]> {
  const response = await http.get("/market-data/popular/sectors", {
    signal,
  });

  return popularSectorSchema.array().parse(response.data);
}
