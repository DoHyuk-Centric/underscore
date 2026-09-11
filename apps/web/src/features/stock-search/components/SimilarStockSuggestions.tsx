type SimilarStockSuggestionsProps = {
  words: string[]
}

export function SimilarStockSuggestions({ words }: SimilarStockSuggestionsProps) {
  if (words.length === 0) {
    return (
      <p className="mt-8 text-[#8b95a1] text-xs text-center">
        함께 찾아드리려고 했는데
        <br />
        유사단어 종목을 찾지 못했습니다
      </p>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1.5 mt-8 text-[#8b95a1] text-xs text-left">
      <span>이런 종목을 찾으시나요?</span>
      <div className="flex flex-wrap justify-start gap-1.5">
        {words.map((word) => (
          <span key={word} className="px-2 py-1 rounded-full bg-[#f2f4f6] text-[#4e5968]">
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}
