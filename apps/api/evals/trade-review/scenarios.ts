import type { TradeReviewRequest } from '@underscore/shared';

/** 점수 기준 한 항목. 답변 글 전체에서 pattern이 보이면 담은 것으로 셉니다. */
export interface Expectation {
  label: string;
  pattern: RegExp;
}

export interface TradeReviewScenario {
  id: 'profit' | 'loss' | 'missing';
  label: string;
  request: TradeReviewRequest;
  expectations: Expectation[];
}

// 판단 리플레이 목업의 수익 / 손실 / 자료 없음 예시를 실제 종목으로 옮긴 시나리오입니다.
// 점수 기준은 이 거래의 고정 입력에서 확인할 수 있고 답변에 담기길 바라는 내용만 둡니다.
const marketComparison: Expectation = { label: '시장 지수와 비교', pattern: /KRX 300|코스피|코스닥/ };

export const SCENARIOS: TradeReviewScenario[] = [
  {
    id: 'profit',
    label: '수익 · 공시로 근거 확인 (아스플로)',
    request: {
      stockCode: '159010',
      buys: [
        { date: '20260824', price: 19800, quantity: 150, reason: '반도체 장비 부품 수주가 늘어날 거라고 봤어요. 수주 공시가 나오는지 확인하려고 샀어요.' },
        { date: '20260825', price: 21000, quantity: 50, reason: '공급계약 공시를 보고 조금 더 샀어요.' },
      ],
      sells: [{ date: '20260923', price: 29500, quantity: 200, reason: '하루에 20% 넘게 올라서 목표 수익률에 가까워졌다고 보고 모두 팔았어요.' }],
    },
    expectations: [
      { label: '매수 근거 원문 인용', pattern: /반도체 장비 부품 수주가 늘어날 거라고 봤어요/ },
      { label: '매도 근거 원문 인용', pattern: /하루에 20% 넘게 올라서 목표 수익률에 가까워졌다고 보고 모두 팔았어요/ },
      { label: '공급계약 매출 대비 43.86%', pattern: /43\.86%/ },
      { label: '공급계약 약 298억 원', pattern: /298억/ },
      { label: '공장 투자 규모', pattern: /30\.64%|363억/ },
      { label: '단기 차입 규모', pattern: /43\.12%|200억/ },
      { label: '수주 "증가"는 따로 판정', pattern: /(늘었는지|늘어난 것인지|증가(했는지|는|까지|한 것인지)).{0,40}(확인되지|확인할 수 없|자료가 없|비교할|어려)/ },
      { label: '추가 매수 가격 첫 매수가 대비 6.06%', pattern: /6\.06%/ },
      { label: '매도일 22.89% 상승', pattern: /22\.89%/ },
      marketComparison,
    ],
  },
  {
    id: 'loss',
    label: '손실 · 근거는 확인, 시장은 하락 (삼성전자)',
    request: {
      stockCode: '005930',
      buys: [
        { date: '20260921', price: 270000, quantity: 20, reason: 'HBM 공급이 늘면서 3분기 실적이 크게 좋아질 거라고 보고 샀어요.' },
        { date: '20261001', price: 275000, quantity: 10, reason: '실적 발표 전에 조금 더 샀어요.' },
      ],
      sells: [{ date: '20261013', price: 233000, quantity: 30, reason: '실적 발표 뒤에도 주가가 계속 떨어져서 손실이 더 커지기 전에 정리했어요.' }],
    },
    expectations: [
      { label: '매수 근거 원문 인용', pattern: /HBM 공급이 늘면서 3분기 실적이 크게 좋아질 거라고 보고 샀어요/ },
      { label: '매도 근거 원문 인용', pattern: /실적 발표 뒤에도 주가가 계속 떨어져서 손실이 더 커지기 전에 정리했어요/ },
      { label: '영업이익 107.4조 원', pattern: /107\.40?조|107조\s*4,?000억/ },
      { label: '전 분기 대비 +20.01%', pattern: /20\.01%/ },
      { label: 'HBM은 공시로 확인되지 않았다고 구분', pattern: /HBM.{0,100}(확인되지|확인할 수 없|자료가 없|확인하기 어려|공시로 확인된 수치는 아니)/ },
      { label: '실적 이유를 기사 출처로', pattern: /기사에 따르면.{0,120}(메모리|HBM|D램|반도체)/ },
      { label: '공시일 이후 11.45% 하락', pattern: /11\.45%/ },
      { label: '추가 매수 가격 첫 매수가 대비 1.85%', pattern: /1\.85%/ },
      { label: '자기주식 매입 종료', pattern: /자기주식|자사주/ },
      marketComparison,
    ],
  },
  {
    id: 'missing',
    label: '자료 부족 · 공시 없음, 근거 일부 미작성, 일부 매도 (NAVER)',
    request: {
      stockCode: '035420',
      buys: [
        { date: '20260918', price: 199000, quantity: 10, reason: 'AI 검색 서비스가 광고 매출을 늘릴 거라고 기대하고 샀어요.' },
        { date: '20260922', price: 201500, quantity: 5, reason: '' },
      ],
      sells: [{ date: '20260930', price: 194000, quantity: 10, reason: '생각보다 주가가 오르지 않아서 일부만 정리했어요.' }],
    },
    expectations: [
      { label: '매수 근거 원문 인용', pattern: /AI 검색 서비스가 광고 매출을 늘릴 거라고 기대하고 샀어요/ },
      { label: '매도 근거 원문 인용', pattern: /생각보다 주가가 오르지 않아서 일부만 정리했어요/ },
      { label: '남은 5주 언급', pattern: /5주/ },
      { label: '추가 매수 가격 첫 매수가 대비 1.26%', pattern: /1\.26%/ },
      { label: '기간 종가 2.02% 하락', pattern: /2\.02%/ },
      marketComparison,
    ],
  },
];
