import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Asset, Badge, Border, BottomCTA, BottomSheet, Button, ListHeader, ListRow, Loader, NumericSpinner, Paragraph,
  RootTopNavigation, Spacing, Tab, TableRow, TextArea, TextField, Top,
  TopNavigation, TopNavigationBackButton, TopNavigationTextButton,
} from '@toss/tds-mobile';

type Screen = 'home' | 'explore' | 'records' | 'stock' | 'success' | 'loading' | 'review' | 'monthly' | 'profile';
type Side = 'buy' | 'sell';
type OrderType = 'market' | 'limit';
type OrderPhase = 'processing' | 'success' | 'judgment';
const colors = { ink: 'var(--adaptiveGrey900)', muted: 'var(--adaptiveGrey600)', red: '#f04452', blue: '#3182f6' };
const tossCheckIcon = 'https://static.toss.im/icons/svg/icon-check-circle-green.svg';
// 미리보기 환경에서 static.toss.im이 차단되어도 체결 완료 상태가 깨지지 않도록 하는 동일 모양의 로컬 SVG 폴백
const tossCheckIconFallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%2320c997'/%3E%3Cpath d='M14 24l6 6 14-14' fill='none' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
const money = (n: number) => `${n.toLocaleString('ko-KR')}원`;
const stocks = [
  { name: '가온테크', sector: '반도체 장비', price: 76400, change: '+1.46%', positive: true },
  { name: '미래에너지', sector: '신재생 에너지', price: 41700, change: '−1.88%', positive: false },
  { name: '해솔바이오', sector: '바이오', price: 46900, change: '−0.85%', positive: false },
];
const screenNames: Record<Screen, string> = {
  home: '내 자산', explore: '종목 찾기', records: '판단 기록', stock: '종목 상세',
  success: '체결 완료', loading: 'AI 작성 중', review: '판단 리플레이', monthly: '월간 리포트', profile: '내 정보',
};
const components: Record<Screen, string[]> = {
  home: ['RootTopNavigation', 'Tab', 'Top', 'ListHeader', 'ListRow', 'Border'],
  explore: ['Tab', 'Top', 'TextField', 'ListRow'],
  records: ['Tab', 'Top', 'ListHeader', 'ListRow', 'Badge'],
  stock: ['TopNavigation', 'Top', 'Tab', 'NumericSpinner', 'BottomCTA.Double', 'BottomSheet', 'BottomSheet.DoubleCTA', 'Asset.Image', 'TextField', 'TextArea'],
  success: ['Top', 'TableRow', 'Button', 'BottomCTA.Single'],
  loading: ['Top', 'Loader', 'ListRow'],
  review: ['TopNavigation', 'Top', 'Badge', 'ListHeader', 'Paragraph', 'TableRow'],
  monthly: ['Top', 'ListHeader', 'TableRow', 'Paragraph', 'ListRow'],
  profile: ['TopNavigation', 'Top', 'ListHeader', 'ListRow'],
};
function Heading({ children, action }: { children: ReactNode; action?: { label: string; run: () => void } }) {
  return <ListHeader title={<ListHeader.TitleParagraph>{children}</ListHeader.TitleParagraph>}
    right={action && <ListHeader.RightArrow onClick={action.run}>{action.label}</ListHeader.RightArrow>} />;
}
function Copy({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return <div className="copy"><Paragraph typography="t5" color={muted ? colors.muted : colors.ink}>{children}</Paragraph></div>;
}
function Rows({ children }: { children: ReactNode }) { return <ul className="rows">{children}</ul>; }
function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return <TableRow align="space-between" left={label} right={value} />;
}
function MenuRow({ title, detail, onClick, right }: { title: string; detail?: string; onClick?: () => void; right?: ReactNode }) {
  return <ListRow border="none" verticalPadding="large" arrowType={onClick ? 'right' : undefined}
    withTouchEffect={!!onClick} onClick={onClick}
    contents={detail ? <ListRow.Texts type="2RowTypeA" top={title} bottom={detail} /> : <ListRow.Texts type="1RowTypeA" top={title} />}
    right={right} />;
}

function PriceChart({ range }: { range: number }) {
  const series = [
    [36, 34, 42, 39, 46, 41, 47, 53, 48, 56, 58, 54, 62, 58, 61, 65],
    [18, 27, 23, 30, 28, 36, 41, 39, 45, 43, 52, 46, 60, 54, 58, 65],
    [10, 13, 9, 19, 23, 18, 29, 24, 33, 41, 37, 45, 54, 49, 57, 65],
  ][range];
  const points = series.map((v, i) => `${16 + i * 19},${136 - v * 1.5}`).join(' ');
  return <figure className="price-chart" aria-label="가온테크 예시 가격 추이. 현재 76,400원.">
    <svg viewBox="0 0 320 156" role="img"><title>가상 데이터로 그린 가격 차트</title>
      <line x1="16" x2="303" y1="105" y2="105" stroke="var(--grey200)" strokeDasharray="3 5" />
      <polyline points={points} stroke="var(--red500)" strokeWidth="2.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="301" cy="38.5" r="3.5" fill="var(--red500)" />
      <text x="16" y="152" fill="var(--grey500)" fontSize="11">{['09:00', '5.23', '5.06'][range]}</text>
      <text x="300" y="152" textAnchor="end" fill="var(--grey500)" fontSize="11">{range === 0 ? '15:30' : '5.29'}</text>
    </svg>
  </figure>;
}

export function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [history, setHistory] = useState<Screen[]>([]);
  const [side, setSide] = useState<Side>('sell');
  const [quantity, setQuantity] = useState(1);
  const [thesis, setThesis] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderPhase, setOrderPhase] = useState<OrderPhase>('processing');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [limitPrice, setLimitPrice] = useState('76400');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState(2);
  const [step, setStep] = useState(0);
  const [reviewReady, setReviewReady] = useState(false);
  const [details, setDetails] = useState(false);
  const [notice, setNotice] = useState('');
  const scroll = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLElement>(null);
  const thesisInput = useRef<HTMLTextAreaElement>(null);
  const rootScreens: Screen[] = ['home', 'explore', 'records'];
  const isRoot = rootScreens.includes(screen);
  const count = quantity;
  const executionPrice = orderType === 'market' ? 76400 : Number(limitPrice.replace(/[^0-9]/g, ''));
  const quantityValid = Number.isInteger(count) && count > 0 && count <= (side === 'sell' ? 10 : 7)
    && Number.isInteger(executionPrice) && executionPrice > 0;
  const valid = quantityValid
    && thesis.trim().length > 0 && Number.isInteger(executionPrice) && executionPrice > 0;
  const go = (next: Screen) => { setHistory(h => [...h, screen]); setScreen(next); setNotice(''); };
  const back = () => { setScreen(history.at(-1) ?? 'home'); setHistory(h => h.slice(0, -1)); };
  const jump = (next: Screen) => { setHistory([]); setScreen(next); setNotice(''); };
  useEffect(() => { scroll.current?.scrollTo(0, 0); setDetails(false); }, [screen]);
  useEffect(() => {
    if (!orderOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOrderOpen(false); }
    };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [orderOpen]);
  useEffect(() => {
    if (!orderOpen) return;
    setOrderPhase('processing');
    const successTimer = window.setTimeout(() => setOrderPhase('success'), 1000);
    const judgmentTimer = window.setTimeout(() => setOrderPhase('judgment'), 2000);
    return () => { window.clearTimeout(successTimer); window.clearTimeout(judgmentTimer); };
  }, [orderOpen]);
  useEffect(() => {
    if (!orderOpen || orderPhase !== 'judgment') return;
    const timer = window.setTimeout(() => thesisInput.current?.focus({ preventScroll: true }), 40);
    return () => window.clearTimeout(timer);
  }, [orderOpen, orderPhase]);
  useEffect(() => {
    if (screen !== 'loading') return;
    setStep(0); setReviewReady(false);
    const stages = [1, 2, 3].map((s) => window.setTimeout(() => setStep(s), s * 1100));
    const done = window.setTimeout(() => setReviewReady(true), 4500);
    return () => [...stages, done].forEach(window.clearTimeout);
  }, [screen]);
  function startOrder(next: Side) {
    if (count < 1 || count > (next === 'sell' ? 10 : 7) || !Number.isInteger(executionPrice) || executionPrice <= 0) return;
    if (side !== next) setThesis('');
    setSide(next);
    setOrderOpen(true);
  }
  function confirmOrder() {
    if (!valid || orderPhase !== 'judgment') return;
    setOrderOpen(false);
    go('success');
  }

  function StockRows({ portfolio = false }: { portfolio?: boolean }) {
    return <Rows>{stocks.filter(s => !portfolio || s.name !== '해솔바이오').filter(s => s.name.includes(search) || s.sector.includes(search)).map((s, i) =>
      <ListRow key={s.name} border="none" verticalPadding="large" withTouchEffect onClick={() => s.name === '가온테크' ? go('stock') : setNotice(`${s.name}는 목록 표시용 예시예요. 가온테크에서 거래 흐름을 확인할 수 있어요.`)}
        left={<span className={`stock-initial initial-${i}`} aria-hidden="true">{s.name[0]}</span>}
        contents={<ListRow.Texts type="2RowTypeA" top={s.name} bottom={portfolio ? (i === 0 ? '10주 · 평균 70,000원' : '6주 · 평균 42,500원') : s.sector} />}
        right={<ListRow.Texts type="Right2RowTypeA" top={money(s.price)} bottom={<span style={{ color: s.positive ? colors.red : colors.blue }}>{portfolio && i === 0 ? '+9.14%' : s.change}</span>} />} />
    )}</Rows>;
  }

  function Home() {
    return <>
      <Top subtitleTop={<Top.SubtitleParagraph>내 가상 자산</Top.SubtitleParagraph>}
        title={<Top.TitleParagraph size={28}>1,574,200원</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={15} color={colors.red}>평가손익 +59,200원 (6.20%)</Top.SubtitleParagraph>} />
      <Rows><DataRow label="보유 종목 평가금액" value="1,014,200원" /><DataRow label="주문 가능 금액" value="560,000원" /></Rows>
      <Spacing size={24} /><Border variant="height16" />
      <Heading action={{ label: '종목 찾기', run: () => jump('explore') }}>보유 종목 2</Heading>
      <StockRows portfolio /><Spacing size={16} /><Border variant="height16" />
      <Heading>내가 남긴 밑줄</Heading>
      <Rows><MenuRow title="실적으로 수요 증가를 확인하기" detail="가온테크 · 매수할 때 남긴 기준" onClick={() => go('stock')} /></Rows>
      <Spacing size={16} /><Border variant="height16" />
      <Heading>이번 달 돌아보기</Heading>
      <Rows><MenuRow title="5월의 판단 기록이 모였어요" detail="완료된 거래 2건 · 월간 리포트" onClick={() => go('monthly')} /></Rows>
      <Spacing size={24} />
    </>;
  }
  function Explore() {
    return <>
      <Top title={<Top.TitleParagraph>어떤 종목이 궁금하세요?</Top.TitleParagraph>} />
      <div className="inset"><TextField variant="box" aria-label="종목 검색" placeholder="종목명 또는 업종을 입력해 주세요" value={search} onChange={e => setSearch(e.target.value)} /></div>
      <Spacing size={24} /><Heading>관심 있게 볼 종목</Heading><StockRows />
      {stocks.filter(s => s.name.includes(search) || s.sector.includes(search)).length === 0 && <Copy muted>검색 결과가 없어요. 가온테크를 검색해 보세요.</Copy>}
    </>;
  }
  function Records() {
    return <>
      <Top subtitleTop={<Top.SubtitleParagraph>2026년 5월</Top.SubtitleParagraph>}
        title={<Top.TitleParagraph>수익과 손실 뒤에<br />내 판단이 남았어요</Top.TitleParagraph>} />
      <Rows><MenuRow title="5월 월간 리포트" detail="거래 2건을 하나의 흐름으로 돌아봐요" onClick={() => go('monthly')} right={<Badge size="small" color="blue" variant="weak">완료</Badge>} /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>완료한 거래</Heading>
      <Rows><MenuRow title="가온테크" detail="5월 29일 · 실현수익 +64,000원" onClick={() => go('review')} right={<Badge size="small" color="blue" variant="weak">AI 리플레이</Badge>} />
        <MenuRow title="해솔바이오" detail="5월 22일 · 실현손실 −54,000원" onClick={() => { go('monthly'); }} right={<Badge size="small" color="elephant" variant="weak">기록 보기</Badge>} /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>이어 쓰는 기록</Heading>
      <Rows><MenuRow title="미래에너지" detail="보유 중 · 새 공시에서 수주 실적 확인하기" /></Rows>
    </>;
  }
  function Stock() {
    return <>
      <Top subtitleTop={<Top.SubtitleParagraph>가온테크 · 반도체 장비</Top.SubtitleParagraph>}
        title={<Top.TitleParagraph size={28}>76,400원</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph size={15} color={colors.red}>전일보다 +1,100원 (1.46%)</Top.SubtitleParagraph>} lowerGap={4} />
      <PriceChart range={range} />
      <Tab size="small" onChange={setRange} ariaLabel="가격 차트 기간">{['1일', '1주', '1개월'].map((s, i) => <Tab.Item key={s} selected={range === i}>{s}</Tab.Item>)}</Tab>
      <Spacing size={24} /><Heading>내 보유 현황</Heading>
      <Rows><DataRow label="보유 수량" value="10주" /><DataRow label="평균 매수가" value="70,000원" /><DataRow label="평가손익" value={<span style={{ color: colors.red }}>+64,000원 (9.14%)</span>} /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>매수할 때 남긴 기준</Heading>
      <Copy>반도체 장비 수요가 늘고 있는지 다음 실적으로 확인하겠다.</Copy><Spacing size={24} />
    </>;
  }
  function Success() {
    return <>
      <Top upper={<Top.SubtitleBadges badges={[{ text: '가상 체결 완료', color: 'blue', variant: 'weak' }]} />}
        title={<Top.TitleParagraph>가온테크 {quantity}주<br />{side === 'sell' ? '매도가' : '매수가'} 완료됐어요</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph>남긴 근거도 거래 기록에 저장했어요.</Top.SubtitleParagraph>} />
      <Rows><DataRow label="주문 방식" value={orderType === 'market' ? '시장가 (현재가)' : '지정가'} /><DataRow label="체결 금액" value={money(count * executionPrice)} />{side === 'sell' && <DataRow label="실현손익" value={<span style={{ color: colors.red }}>+{money(count * (executionPrice - 70000))}</span>} />}</Rows>
      <Spacing size={32} /><Border variant="height16" /><Heading>{side === 'sell' ? '판단의 배경도 돌아볼까요?' : '다음에 확인할 기준이 생겼어요'}</Heading>
      <Copy>{side === 'sell' ? '시장·수급·공시와 내가 남긴 근거를 한 문서에서 비교할 수 있어요.' : '매수할 때 남긴 기준을 보관했어요. 거래를 마친 뒤에는 AI 리플레이로 돌아볼 수 있어요.'}</Copy>
      <Spacing size={24} /><div className="inset"><Button display="block" variant="weak" onClick={() => jump('records')}>거래 기록만 보기</Button></div>
    </>;
  }
  function Loading() {
    const stages = ['거래일지를 펼쳤어요', '공시에서 단서를 찾고 있어요', '시장과 수급의 흐름을 맞추고 있어요', '이번 판단에 밑줄을 긋고 있어요'];
    return <><Top title={<Top.TitleParagraph>{reviewReady ? <>판단 리플레이가<br />완성됐어요</> : <>내 판단을 돌아볼<br />단서를 모으고 있어요</>}</Top.TitleParagraph>}
      subtitleBottom={<Top.SubtitleParagraph>{reviewReady ? '확인된 사실과 내 기준을 함께 읽어보세요.' : '잠깐만 기다려 주세요.'}</Top.SubtitleParagraph>} />
      <div className="loading-icon">{reviewReady ? <Badge size="small" color="blue" variant="weak">작성 완료</Badge> : <Loader size="large" />}</div>
      <Rows>{stages.map((s, i) => <MenuRow key={s} title={s} right={<Badge size="small" color={i <= step ? 'blue' : 'elephant'} variant="weak">{reviewReady || i < step ? '완료' : i === step ? '작성 중' : '대기'}</Badge>} />)}</Rows>
    </>;
  }
  function Review() {
    return <>
      <Top subtitleTop={<Top.SubtitleParagraph>가온테크 · 5.06–5.29</Top.SubtitleParagraph>}
        title={<Top.TitleParagraph>수익은 났지만,<br />실적 확인 전이었어요</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph>섹터 상승과 외국인 순매수가 함께 나타난 구간에서 수익을 확정했어요.</Top.SubtitleParagraph>} />
      <Rows><DataRow label="가상 매수 → 매도" value="70,000원 → 76,400원" /><DataRow label="실현수익률" value={<span style={{ color: colors.red }}>+9.1%</span>} /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>같은 기간에 확인된 사실</Heading>
      <div className="comparison" role="img" aria-label="보유 기간 수익률: 코스피 2.1%, 반도체 장비 8.4%, 가온테크 9.1%.">
        {[['KOSPI', 2.1], ['반도체 장비', 8.4], ['가온테크', 9.1]].map(([label, value], i) => <div className="comparison-row" key={label}>
          <Paragraph typography="t7">{label}</Paragraph><div className="bar-track"><div style={{ width: `${Number(value) * 10}%`, background: i === 2 ? 'var(--blue500)' : 'var(--grey300)' }} /></div><Paragraph typography="t7" fontWeight="semibold">+{value}%</Paragraph>
        </div>)}
      </div>
      <Rows><MenuRow title="외국인 12일 순매수" detail="17거래일 누적 +24억 원 · 기관 −11억 원" /><MenuRow title="5월 19일 생산설비 관련 공시" detail="수요 증가를 실적으로 확정한 공시는 아니었어요" /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>가능한 해석</Heading>
      <Copy>종목 상승률은 섹터보다 0.7%p 높았어요. 강한 업종 흐름과 함께 움직였지만, 이 차이만으로 상승의 원인을 나눌 수는 없어요.</Copy>
      <Spacing size={16} /><Copy>외국인 순매수도 같은 기간에 관찰됐어요. 매수 이유나 가격에 미친 영향은 이 기록만으로 확정하지 않아요.</Copy>
      <Spacing size={24} /><Border variant="height16" /><Heading>내 판단으로 남길 부분</Heading>
      <Copy>처음에는 ‘실적을 확인하겠다’고 적었지만, 발표 전에 수익을 확정했어요. 실적 확인과 수익 확정이라는 두 기준을 어떻게 연결할지는 내 다음 기록으로 남겨볼 수 있어요.</Copy>
      <Spacing size={24} /><Rows><MenuRow title="출처와 용어 보기" detail="수익률 · 순매수 · 공시" onClick={() => setDetails(v => !v)} /></Rows>
      {details && <><Copy muted>순매수는 매수금액에서 매도금액을 뺀 값이에요. 초과수익은 종목 수익률에서 비교 대상 수익률을 뺀 값이에요.</Copy><Spacing size={16} /><Copy muted>이 시안의 종목·거래·수급·공시는 모두 가상 예시예요. 실제 리포트에는 조회 시각, 데이터 제공처, DART 접수번호와 원문 링크가 표시돼요.</Copy></>}
      <Spacing size={32} />
    </>;
  }
  function Monthly() {
    return <>
      <Top subtitleTop={<Top.SubtitleParagraph>사용자 A · 2026년 5월</Top.SubtitleParagraph>}
        title={<Top.TitleParagraph>확인을 기다리는 기준과<br />실제 행동 사이</Top.TitleParagraph>}
        subtitleBottom={<Top.SubtitleParagraph>수익과 손실이 각각 한 건 있었어요. 두 거래에서 확인 시점과 행동의 차이가 남았어요.</Top.SubtitleParagraph>} />
      <Rows><DataRow label="완료한 거래" value="2건" /><DataRow label="실현손익 합계" value={<span style={{ color: colors.red }}>+10,000원</span>} /><DataRow label="보유 중인 거래" value="1건 · 결과 평가 제외" /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>수익이 난 가온테크</Heading>
      <Copy>종목 +9.1%, 섹터 +8.4%로 같은 방향으로 올랐어요. 외국인은 17일 중 12일 순매수했어요. 이익은 남았지만 처음 적은 실적 확인은 매도일까지 이뤄지지 않았어요.</Copy>
      <Rows><MenuRow title="가온테크 판단 리플레이" detail="시장·수급·공시를 함께 보기" onClick={() => go('review')} /></Rows>
      <Spacing size={16} /><Border variant="height16" /><Heading>손실이 난 해솔바이오</Heading>
      <Copy>확인하려던 공시가 나오기 전에 진입했고, 확인되지 않았다는 사실을 매도 이유로 남겼어요. 이 기록은 ‘가설을 세운 시점’과 ‘확인을 기다린 기간’을 함께 돌아보게 해요.</Copy>
      <Spacing size={24} /><Border variant="height16" /><Heading>이번 달의 밑줄</Heading>
      <Copy>가온테크는 확인 전 수익 확정, 해솔바이오는 미확인을 이유로 손실 확정이었어요. 결과는 달랐지만, 두 거래 모두 확인할 사실을 실제 행동과 연결하는 기준이 남았어요.</Copy>
      <Spacing size={24} /><Heading>다음 기록에 남겨둘 것</Heading>
      <Rows><MenuRow title="확인할 사실의 출처와 날짜" detail="처음의 근거가 사실이었는지 가설이었는지 비교해요" />
        <MenuRow title="확인 전에 거래를 마친 이유" detail="수익·손실과 별개로 실제 판단이 바뀐 지점을 남겨요" />
        <MenuRow title="미래에너지의 새 정보" detail="보유 중인 근거가 이후 공시로 달라졌는지 이어 써요" /></Rows><Spacing size={24} />
    </>;
  }
  function Profile() {
    return <><Top title={<Top.TitleParagraph>사용자 A</Top.TitleParagraph>} subtitleBottom={<Top.SubtitleParagraph>내 기준으로 쌓아가는 투자 기록</Top.SubtitleParagraph>} />
      <Rows><DataRow label="남긴 거래 기록" value="12개" /><DataRow label="판단 리플레이" value="8개" /></Rows>
      <Spacing size={24} /><Border variant="height16" /><Heading>내 기록 관리</Heading>
      <Rows><MenuRow title="월간 리포트" onClick={() => go('monthly')} /><MenuRow title="판단 리플레이 모아보기" onClick={() => jump('records')} />
        <MenuRow title="AI 리포트 이용 내역" detail="사용한 횟수와 생성 상태를 확인해요" onClick={() => setNotice('요금제는 아직 확정되지 않았어요. 이 화면은 이용 내역의 디자인 자리예요.')} /></Rows></>;
  }
  const views: Record<Screen, () => ReactNode> = { home: Home, explore: Explore, records: Records, stock: Stock, success: Success, loading: Loading, review: Review, monthly: Monthly, profile: Profile };

  return <div className="design-workspace">
    <aside className="design-sidebar">
      <div className="design-label">밑줄 / DESIGN 02</div>
      <h1>토스의 컴포넌트로,<br />밑줄의 경험을.</h1>
      <p>공식 TDS Mobile 2.5.1을 직접 렌더링한 앱인토스 디자인 시안</p>
      <div className="screen-links">{(['home', 'explore', 'records', 'stock', 'review', 'monthly', 'profile'] as Screen[]).map(s =>
        <Button key={s} variant="weak" color={screen === s ? 'primary' : 'dark'} size="small" onClick={() => jump(s)}>{screenNames[s]}</Button>)}
      </div>
      <div className="design-details"><h2>이 화면의 공식 컴포넌트</h2><p>{components[screen].join(' · ')}</p></div>
      <a href="https://tossmini-docs.toss.im/tds-mobile/" target="_blank" rel="noreferrer">TDS 공식 문서 ↗</a>
      <p className="preview-footnote">차트와 레이아웃만 밑줄 전용 구성입니다. 종목·거래·수급·공시는 가상 예시이며, AI 작성 단계도 시연용이에요.</p>
    </aside>
    <main className="app-surface" ref={surface} aria-label="밑줄 디자인 미리보기">
      <div className="preview-ribbon">디자인 미리보기 · 예시 데이터</div>
      {isRoot ? <RootTopNavigation fixed style={{ position: 'relative', flexShrink: 0 }} content="밑줄" trailing={<TopNavigationTextButton onClick={() => go('profile')}>내 정보</TopNavigationTextButton>} />
        : <TopNavigation fixed style={{ position: 'relative', flexShrink: 0 }} content={screenNames[screen]} leading={<TopNavigationBackButton onClick={back} aria-label="뒤로 가기" />} trailing={<TopNavigationTextButton onClick={() => jump('home')}>홈</TopNavigationTextButton>} />}
      {isRoot && <Tab onChange={i => jump(rootScreens[i])} ariaLabel="주요 화면">{rootScreens.map(s => <Tab.Item key={s} selected={screen === s}>{screenNames[s]}</Tab.Item>)}</Tab>}
      <div className="app-scroll" ref={scroll}>
        {views[screen]()}
        {notice && <div role="status" className="preview-notice"><Paragraph typography="t6">{notice}</Paragraph></div>}
      </div>
      <div className="cta-slot">
        {screen === 'stock' && <BottomCTA.Double fixed={false}
          topAccessory={<div className="quick-order">
            <Tab size="small" onChange={(index) => setOrderType(index === 0 ? 'market' : 'limit')} ariaLabel="주문 방식">
              <Tab.Item selected={orderType === 'market'}>시장가 · 현재가</Tab.Item>
              <Tab.Item selected={orderType === 'limit'}>지정가</Tab.Item>
            </Tab>
            {orderType === 'limit' && <TextField variant="line" label="주문 가격" labelOption="sustain" aria-label="지정가 가격" prefix="₩" suffix="원" inputMode="numeric" value={limitPrice}
              onChange={e => setLimitPrice(e.target.value.replace(/[^0-9]/g, ''))} help="입력한 가격에 도달하면 체결되는 방식이에요" />}
            <div className="quantity-row">
              <Paragraph typography="t5" fontWeight="semibold">수량 (주)</Paragraph>
              <NumericSpinner size="large" number={quantity} minNumber={1} maxNumber={10} onNumberChange={setQuantity}
                aria-label="거래 수량" a11yProps={{ minusButtonAriaLabel: '수량 감소', plusButtonAriaLabel: '수량 증가' }} />
            </div>
            <div className="quantity-row" aria-live="polite"><Paragraph typography="t7" color={colors.muted}>{orderType === 'market' ? '현재가 기준 예상 금액' : '지정가 기준 예상 금액'}</Paragraph><Paragraph typography="t6" fontWeight="semibold">{executionPrice > 0 ? money(count * executionPrice) : '—'}</Paragraph></div>
            <Paragraph typography="t7" color={count > 7 ? colors.blue : colors.muted}>{count > 7 ? '매수 가능 수량을 초과했어요 · 최대 7주' : '매수 가능 7주 · 매도 가능 10주'}</Paragraph>
          </div>}
          leftButton={<Button size="xlarge" variant="weak" disabled={!quantityValid || count > 10} onClick={() => startOrder('sell')}>매도</Button>}
          rightButton={<Button size="xlarge" disabled={!quantityValid || count > 7} onClick={() => startOrder('buy')}>매수</Button>} />}
        {screen === 'success' && <BottomCTA.Single fixed={false} onClick={() => side === 'sell' ? go('loading') : jump('records')}>{side === 'sell' ? '판단 리플레이 만들기' : '내 기록 확인하기'}</BottomCTA.Single>}
        {screen === 'loading' && reviewReady && <BottomCTA.Single fixed={false} onClick={() => go('review')}>판단 리플레이 확인하기</BottomCTA.Single>}
      </div>
      <BottomSheet className="judgment-sheet" open={orderOpen} onClose={() => setOrderOpen(false)} portalContainer={surface.current}
        aria-label={`${side === 'sell' ? '매도' : '매수'} 판단 남기기`} hasTextField disableChildrenDragging
        header={orderPhase === 'processing' ? <BottomSheet.Header><div className="judgment-processing"><Loader size="small" /><Paragraph typography="t4" fontWeight="semibold">주문을 안전하게 반영하고 있어요</Paragraph></div></BottomSheet.Header> : orderPhase === 'success' ? <BottomSheet.Header><div className="judgment-success"><Asset.Image src={tossCheckIcon} onError={e => { e.currentTarget.src = tossCheckIconFallback; }} frameShape={Asset.frameShape.SquareLarge} scale={1} alt="체결 완료" /><Paragraph typography="t4" fontWeight="semibold">성공적으로 {side === 'sell' ? '매도' : '매수'}가 체결되었습니다</Paragraph></div></BottomSheet.Header> : <BottomSheet.Header><div className="judgment-success"><Asset.Image src={tossCheckIcon} onError={e => { e.currentTarget.src = tossCheckIconFallback; }} frameShape={Asset.frameShape.SquareLarge} scale={1} alt="체결 완료" /><Paragraph typography="t4" fontWeight="semibold">이제 판단을 남겨주세요</Paragraph></div></BottomSheet.Header>}
        headerDescription={<BottomSheet.HeaderDescription>가온테크 {quantity}주 · {orderPhase === 'processing' ? '체결 처리 중' : orderType === 'market' ? '시장가 · 현재가' : `지정가 ${money(executionPrice)}`}</BottomSheet.HeaderDescription>}
        cta={orderPhase === 'processing' ? <BottomSheet.CTA disabled>체결 처리 중</BottomSheet.CTA> : orderPhase === 'success' ? <BottomSheet.CTA disabled>판단 입력 준비 중</BottomSheet.CTA> : <BottomSheet.DoubleCTA leftButton={<Button size="xlarge" variant="weak" onClick={() => setOrderOpen(false)}>닫기</Button>} rightButton={<Button size="xlarge" disabled={!valid} onClick={confirmOrder}>판단 저장</Button>} />}>
        {orderPhase === 'processing' ? <div className="execution-wait"><Paragraph typography="t5" color={colors.muted}>주문을 안전하게 반영하고 있어요.<br />잠시만 기다려 주세요.</Paragraph></div> : orderPhase === 'success' ? <div className="execution-wait"><Paragraph typography="t5" color={colors.muted}>거래가 기록됐어요.<br />잠시 후 판단 입력으로 넘어갈게요.</Paragraph></div> : <>
          <Rows><DataRow label="체결 가격" value={money(executionPrice)} /><DataRow label="거래 금액" value={money(count * executionPrice)} /></Rows>
          <Spacing size={16} />
          <TextArea ref={thesisInput} variant="box" aria-label="거래 근거" placeholder={side === 'sell' ? '지금 매도하려는 이유를 남겨주세요' : '어떤 근거로 매수하나요?'} value={thesis}
            onChange={e => setThesis(e.target.value)} maxLength={200} rows={3} help={`${thesis.length}/200자 · 나중에 판단 리플레이에서 비교해요`} />
        </>}
      </BottomSheet>
    </main>
  </div>;
}
