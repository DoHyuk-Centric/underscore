const EXAMPLES = ['삼전(삼성전자)', '카뱅(카카오뱅크)', '한전(한국전력)']

export function SearchExamples() {
  return (
    <div className="flex flex-col items-start gap-1.5 mt-8 text-[#8b95a1] text-xs text-left">
      <span>이렇게도 검색해보세요!</span>
      <div className="flex flex-wrap justify-start gap-1.5">
        {EXAMPLES.map((example) => (
          <span key={example} className="px-2 py-1 rounded-full bg-[#f2f4f6] text-[#4e5968]">
            {example}
          </span>
        ))}
      </div>
    </div>
  )
}
