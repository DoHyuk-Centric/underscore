import { SearchEmptyState } from './SearchEmptyState'

const SUPPORT_EMAIL = 'clzlsdlwhgdk12@gmail.com'

export function SearchErrorState() {
  return (
    <SearchEmptyState icon="!" title="문제가 발생했습니다.">
      <p className="mt-8 text-[#8b95a1] text-xs text-center">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#3182f6] underline">
          고객센터
        </a>
        로 문의해주세요.
      </p>
    </SearchEmptyState>
  )
}
