import { stockDiagnosisSchema, type StockDiagnosis } from "@underscore/shared";
import { http } from "../../../lib/http";

export async function getStockDiagnoses(
  signal?: AbortSignal,
): Promise<StockDiagnosis[]> {
  const response = await http.get("/market-data/popular/diagnoses", {
    signal,
  });

  return stockDiagnosisSchema.array().parse(response.data);
}
