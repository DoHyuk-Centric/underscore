import { stockSchema, type KRXStock } from '@underscore/shared'
import { http } from '../../../lib/http'

export async function searchStocks(
  query: string,
  signal?: AbortSignal,
): Promise<KRXStock[]> {
  const response = await http.get('/market-data/search', {
    params: { q: query },
    signal,
  })

  return stockSchema.array().parse(response.data)
}
