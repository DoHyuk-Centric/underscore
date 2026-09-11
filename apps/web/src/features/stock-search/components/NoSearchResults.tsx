import { SearchEmptyState } from './SearchEmptyState'
import { SimilarStockSuggestions } from './SimilarStockSuggestions'

type NoSearchResultsProps = {
  query: string
  similarWords?: string[]
}

export function NoSearchResults({ query, similarWords = [] }: NoSearchResultsProps) {
  return (
    <SearchEmptyState icon="×" title={`'${query}'에 대한 검색 결과가 없어요`}>
      <SimilarStockSuggestions words={similarWords} />
    </SearchEmptyState>
  )
}
