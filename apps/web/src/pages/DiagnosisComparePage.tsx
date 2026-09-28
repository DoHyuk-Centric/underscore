import { useState } from 'react'
import {
  StockComparison,
  type CompareView,
} from '../features/diagnosis-compare/components/StockComparison'
import { SnapshotSummary } from '../features/diagnosis-compare/components/SnapshotSummary'
import {
  countChangedFields,
  getPairingMode,
  pairDiagnoses,
} from '../features/diagnosis-compare/compare'
import {
  snapshots,
  TARGET_VERSION,
  type DiagnosisSnapshot,
} from '../features/diagnosis-compare/snapshots'

const SnapshotSelect = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (id: string) => void
}) => (
  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#6b7684]">
    {label}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-lg border border-[#e5e8eb] bg-white px-2 py-1.5 text-[13px] text-[#191f28]"
    >
      {snapshots.map((snapshot) => (
        <option key={snapshot.id} value={snapshot.id}>
          {snapshot.version} · {snapshot.baseDate} · {snapshot.title}
        </option>
      ))}
    </select>
  </label>
)

const VIEWS: { value: CompareView; label: string }[] = [
  { value: 'fields', label: '항목별' },
  { value: 'cards', label: '카드 화면' },
]

const findSnapshot = (id: string): DiagnosisSnapshot =>
  snapshots.find((snapshot) => snapshot.id === id) ?? snapshots[0]

// 최신 버전과 같은 기준일의 목표가 있으면 그것을, 없으면 아무 목표나, 그것도 없으면 직전 버전을 기준으로 삼습니다.
const defaultLeftId = () => {
  const latest = snapshots.at(-1)
  const targets = snapshots.filter((snapshot) => snapshot.version === TARGET_VERSION)

  return (
    (targets.find((snapshot) => snapshot.baseDate === latest?.baseDate) ??
      targets[0] ??
      snapshots.at(-2))?.id ?? ''
  )
}

/** 개선 로그에 남긴 버전별 AI 진단 결과를 종목마다 나란히 비교하는 개발용 페이지 */
const DiagnosisComparePage = () => {
  const [leftId, setLeftId] = useState(defaultLeftId)
  const [rightId, setRightId] = useState(snapshots.at(-1)?.id ?? '')
  const [view, setView] = useState<CompareView>('fields')

  if (snapshots.length < 2) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f7f8fa] p-4 text-sm text-[#8b95a1]">
        비교하려면 docs/ai-diagnosis-log에 버전 파일이 2개 이상 필요해요.
      </main>
    )
  }

  const left = findSnapshot(leftId)
  const right = findSnapshot(rightId)
  const pairingMode = getPairingMode(left, right)
  const pairs = pairDiagnoses(left, right)

  return (
    <main className="min-h-dvh bg-[#f7f8fa] pb-12">
      <header className="sticky top-0 z-10 border-b border-[#e5e8eb] bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3">
          <h1 className="m-0 mr-auto text-lg font-bold text-[#191f28]">AI 진단 비교</h1>
          <SnapshotSelect label="기준" value={left.id} onChange={setLeftId} />
          <SnapshotSelect label="비교" value={right.id} onChange={setRightId} />
          <div className="flex rounded-lg bg-[#f2f4f6] p-0.5">
            {VIEWS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setView(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                  view === option.value
                    ? 'bg-white text-[#191f28] shadow-sm'
                    : 'text-[#8b95a1]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <nav className="mx-auto mt-2 flex max-w-5xl gap-1.5 overflow-x-auto pb-1">
          {pairs.map((pair) => {
            const changed = pairingMode === 'stock' ? countChangedFields(pair) : 0

            return (
              <a
                key={pair.key}
                href={`#pair-${pair.key}`}
                className="shrink-0 rounded-full bg-[#f2f4f6] px-2.5 py-1 text-xs font-medium text-[#4e5968] no-underline hover:bg-[#e5e8eb]"
              >
                {pair.rank}. {(pair.right ?? pair.left)?.stockName}
                {changed > 0 ? <span className="ml-1 text-[#3182f6]">{changed}</span> : null}
              </a>
            )
          })}
        </nav>
      </header>

      <div className="mx-auto grid max-w-5xl gap-3 px-4 pt-4">
        {pairingMode === 'rank' ? (
          <p className="m-0 rounded-xl bg-[#fff8e6] px-3 py-2 text-[13px] leading-relaxed text-[#8a5a1f]">
            두 버전의 기준일이 달라요({left.baseDate} / {right.baseDate}). 종목이 서로 달라서
            같은 순위끼리 나란히 놓았어요. 내용이 얼마나 풍부한지와 문체를 비교하는 용도로 보세요.
          </p>
        ) : null}
        <SnapshotSummary left={left} right={right} />
        {pairs.map((pair) => (
          <StockComparison
            key={pair.key}
            pair={pair}
            left={left}
            right={right}
            view={view}
            pairingMode={pairingMode}
          />
        ))}
      </div>
    </main>
  )
}

export default DiagnosisComparePage
