import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, BottomCTA, Button, ListRow, Loader, Tab, TextArea, TextField, Top, TopNavigation, TopNavigationBackButton } from '@toss/tds-mobile';
import { chronologyError, metrics, money, quote, signed, stocks, tone, type Side, type Stock, type Trade } from './trades';

type Screen = 'login' | 'home' | 'search' | 'trade' | 'summary' | 'loading' | 'failed' | 'result';
type Report = { id: string; stock: Stock; trades: Trade[]; buyReason: string; sellReason: string; example: boolean; missing: boolean };
const stages = ['거래일지를 펼쳐 보는 중', '공시 숲에서 단서를 찾는 중', '감정은 빼고 숫자를 맞춰 보는 중', '잔소리 수위를 조절하는 중'];
const names: Record<Screen, string> = { login: '로그인', home: 'AI 홈', search: '종목 검색', trade: '거래 입력', summary: '거래 요약', loading: 'AI 분석', failed: '분석 실패', result: '판단 리플레이' };
function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  return <Top title={<Top.TitleParagraph>{children}</Top.TitleParagraph>} subtitleBottom={sub && <Top.SubtitleParagraph>{sub}</Top.SubtitleParagraph>} />;
}
function Section({ title, children }: { title: ReactNode; children: ReactNode }) {
  return <section className="review-section"><h2>{title}</h2>{children}</section>;
}
function Row({ label, children }: { label: string; children: ReactNode }) {
  return <div className="data-row"><span>{label}</span><strong>{children}</strong></div>;
}
function Mark({ stock }: { stock: Stock }) { return <span className="stock-mark">{stock.name[0]}</span>; }
function Source({ id }: { id: string }) { return <a className="source-chip" href={'#source-' + id}>근거 {id}</a>; }

export function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [stock, setStock] = useState(stocks[0]);
  const [search, setSearch] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [side, setSide] = useState<Side>('매수');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [buyReason, setBuyReason] = useState('');
  const [sellReason, setSellReason] = useState('');
  const [notice, setNotice] = useState('');
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const scroll = useRef<HTMLDivElement>(null);
  const m = metrics(trades);
  const q = quote(stock, date);
  const p = Number(price), n = Number(quantity);
  const candidate: Trade = { id: editing ?? 'draft', side, date, price: p, quantity: n };
  const proposed = editing ? trades.map(t => t.id === editing ? candidate : t) : [...trades, candidate];
  const error = !date ? '거래일을 선택해 주세요.' : !q ? '해당 날짜의 시세를 확인하지 못했어요. 다른 날짜를 선택해 주세요.'
    : !price || !Number.isFinite(p) || p < Math.min(q.open, q.close) || p > Math.max(q.open, q.close) ? '가격을 당일 시가와 종가 사이로 입력해 주세요.'
    : !Number.isSafeInteger(n) || n <= 0 ? '수량은 1주 이상의 정수로 입력해 주세요.'
    : chronologyError(proposed);
  const dirty = !!(price || quantity || editing);
  const canReview = m.buyQty > 0 && m.sellQty > 0 && !chronologyError(trades);
  function go(next: Screen) { setNotice(''); setScreen(next); }
  useEffect(() => { scroll.current?.scrollTo(0, 0); }, [screen]);
  useEffect(() => {
    if (screen !== 'loading') return;
    setStep(0); setDone(false);
    const timers = [1, 2, 3].map(i => window.setTimeout(() => setStep(i), i * 900));
    timers.push(window.setTimeout(() => {
      if (failNext) { setFailNext(false); setScreen('failed'); }
      else {
        setStep(4); setDone(true);
        if (report) setReports(old => old.some(r => r.id === report.id) ? old : [report, ...old]);
      }
    }, 4000));
    return () => timers.forEach(window.clearTimeout);
  }, [screen, failNext, report]);
  function clearForm() { setEditing(null); setPrice(''); setQuantity(''); }
  function add() {
    if (error) return;
    const item = { ...candidate, id: editing ?? crypto.randomUUID() };
    setTrades(editing ? trades.map(t => t.id === editing ? item : t) : [...trades, item]);
    clearForm(); setNotice(editing ? '거래를 수정했어요.' : side + ' 기록을 추가했어요. 다음 거래도 입력할 수 있어요.');
  }
  function selectStock(s: Stock) { setStock(s); setTrades([]); setDate(''); clearForm(); setBuyReason(''); setSellReason(''); setSide('매수'); go('trade'); }
  function start() {
    const hasFixture = stock.code === 'DEMO01' && m.first === '2026-05-06' && m.last === '2026-05-29';
    const next: Report = { id: crypto.randomUUID(), stock, trades: trades.map(t => ({ ...t })), buyReason: buyReason.trim(), sellReason: sellReason.trim(), example: false, missing: !hasFixture };
    setReport(next); go('loading');
  }
  function demo(kind: 'profit' | 'loss' | 'flat' | 'missing' | 'failed') {
    const s = stocks[0];
    const sellPrice = kind === 'loss' ? 64000 : kind === 'flat' ? 70000 : 76400;
    const ts: Trade[] = [
      { id: 'demo-b1', side: '매수', date: '2026-05-06', price: 70000, quantity: 6 },
      { id: 'demo-b2', side: '매수', date: '2026-05-06', price: 70000, quantity: 4 },
      { id: 'demo-s1', side: '매도', date: '2026-05-29', price: sellPrice, quantity: 10 },
    ];
    setReport({ id: crypto.randomUUID(), stock: s, trades: ts, buyReason: '반도체 장비 수요가 늘고 있는지 실적으로 확인해 보겠다.', sellReason: '실적 발표 전에 수익을 확정했다.', example: true, missing: kind === 'missing' });
    if (kind === 'loss' || kind === 'flat') setReport(r => r && ({ ...r, sellReason: '실적 발표 전에 거래를 마무리했다.' }));
    setFailNext(kind === 'failed'); go(kind === 'failed' ? 'loading' : 'result');
  }
  function tradeList(editable: boolean, items = trades) {
    return <div className="trade-list">{items.length === 0 ? <p className="empty">아직 입력한 거래가 없어요.<br />첫 매수 기록을 추가해 주세요.</p> : items.map((t, i) =>
      <div className="trade-card" key={t.id}><span className={'trade-side ' + (t.side === '매수' ? 'buy' : 'sell')}>{t.side}</span>
        <div><strong>{money(t.price)} · {t.quantity}주</strong><p>{t.date} · {money(t.price * t.quantity)}</p></div>
        {editable && <div className="trade-actions"><button aria-label={i + 1 + '번째 거래 수정'} onClick={() => { setEditing(t.id); setSide(t.side); setDate(t.date); setPrice(String(t.price)); setQuantity(String(t.quantity)); scroll.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}>수정</button>
          <button aria-label={i + 1 + '번째 거래 삭제'} onClick={() => { const next = trades.filter(x => x.id !== t.id); const issue = chronologyError(next); if (issue) setNotice('이 매수에 연결된 매도 기록을 먼저 수정하거나 삭제해 주세요.'); else { setTrades(next); if (editing === t.id) clearForm(); } }}>삭제</button></div>}
      </div>)}</div>;
  }
  function summaryMetrics(ts = trades) {
    const x = metrics(ts);
    return <><div className="metric-grid">
      <div><small>매수 평단가</small><strong>{money(x.buyAvg)}</strong></div><div><small>매도 평단가</small><strong>{x.sellQty ? money(x.sellAvg) : '매도 기록 없음'}</strong></div>
      <div className="metric-result"><small>평단가 비교 수익률</small><strong className={tone(x.averageRate)}>{x.sellQty ? signed(x.averageRate) + '%' : '—'}</strong></div></div>
      <Row label="매수 / 매도 수량">{x.buyQty}주 / {x.sellQty}주</Row>
      <Row label="남은 수량">{x.remaining}주</Row>
      {x.sellQty > 0 && <Row label="실현손익"><span className={tone(x.pnl)}>{signed(x.pnl, 0)}원 ({signed(x.realizedRate)}%)</span></Row>}
      <p className="fine">수수료·세금 제외. 평단가 비교는 전체 매수·매도의 가중평균 기준이며, 실현손익은 먼저 산 주식부터 매도한 것으로 계산해요.</p>
      {x.remaining > 0 && <p className="info-note">남은 {x.remaining}주는 아직 보유 중이에요. 미실현 손익은 이번 결과에 포함하지 않아요.</p>}</>;
  }
  function resultView(r: Report) {
    const x = metrics(r.trades);
    const context = !r.missing;
    const loss = r.example && x.realizedRate < 0;
    const market = loss ? -1.5 : 2.1, sector = loss ? -4.7 : 8.4;
    const stockReturn = r.example ? x.averageRate : (76400 / 70000 - 1) * 100;
    return <><div className="report-intro"><Badge size="small" color="blue" variant="weak">판단 리플레이</Badge><p>{r.stock.name} · {x.first} ~ {x.last}</p>
      <h1>수익과 손실 너머,<br />내 판단을 돌아볼 시간</h1>
      <div className={'report-return ' + tone(x.realizedRate)}>{signed(x.realizedRate)}%<small>실현 수익률 · {signed(x.pnl, 0)}원</small></div>
      <p className="report-summary">{context ? (r.example ? (loss ? '섹터 하락과 함께 손실이 발생한 예시예요. 처음 세운 기준과 실제 매도 이유를 나란히 살펴보세요.' : '강한 섹터 흐름과 외국인 순매수가 함께 나타난 예시예요. 실적 확인 전 거래를 마쳤다는 기록이 남아 있어요.') : '입력한 거래 결과와 같은 기간의 시장 맥락을 나란히 정리했어요. 아래 시장·수급·공시는 디자인용 예시 자료예요.') : '입력한 거래와 근거를 정리했어요. 확인되지 않은 시장·공시 자료는 해석에 포함하지 않았어요.'} <Source id="T1" />{context && <Source id="M1" />}{context && <Source id="F1" />}</p></div>
      <div className="report-toc"><a href="#facts">거래 사실</a><a href="#market">시장 맥락</a><a href="#judgment">내 판단</a><a href="#sources">출처</a></div>
      <Section title="01 · 확인된 거래 사실"><div id="facts">{summaryMetrics(r.trades)}<Row label="첫 매수 ~ 마지막 매도">{x.days}일 (달력일)</Row>
        <details><summary>분할 거래 {r.trades.length}건 펼쳐보기</summary>{tradeList(false, r.trades)}</details><Source id="T1" /></div></Section>
      <Section title="처음의 근거와 실제 결과"><div className="thesis-card"><span>매수 당시의 생각</span><p>{r.buyReason || '매수 근거를 남기지 않았어요.'}</p></div>
        <div className="thesis-card"><span>매도 당시의 생각</span><p>{r.sellReason || '매도 근거를 남기지 않았어요.'}</p></div>
        <p className="body-copy">{!r.buyReason || !r.sellReason ? '기록이 없는 부분의 판단이나 감정은 추정하지 않았어요. 확인할 수 있는 거래 결과만 정리했어요.' : r.example ? '매수 때는 실적 확인을 기준으로 적었고, 매도 기록에는 발표 전에 거래를 마쳤다고 남겼어요. 결과와 처음의 기준 달성 여부는 나누어 돌아볼 수 있어요.' : '위 두 기록을 거래 결과와 나란히 비교해 보세요. 이 목업은 입력 문장의 의도나 감정을 자동으로 판정하지 않아요.'} <Source id="T1" /></p></Section>
      <Section title="02 · 시장과 섹터 흐름"><div id="market">{context ? <><p className="fine">동일 기간 비교 · 예시 데이터</p>
        {[['KOSPI', market], [r.stock.sector, sector], [r.stock.name, stockReturn]].map(([label, value], i) => <div className="benchmark" key={String(label)}><span>{label}</span><div><i style={{ width: Math.max(4, Math.abs(Number(value)) / 12 * 100) + '%', background: Number(value) < 0 ? '#3182f6' : i === 2 ? '#f04452' : '#f7a7ae' }} /></div><b className={tone(Number(value))}>{signed(Number(value))}%</b></div>)}
        <p className="body-copy">종목과 시장의 차이는 {signed(stockReturn - market)}%p, 섹터와의 차이는 {signed(stockReturn - sector)}%p예요. 같은 기간의 가격 변화이며 상승·하락의 원인을 확정하는 수치는 아니에요. <Source id="M1" /></p><p className="fine">종목 수익률은 기간 시작·종료 시세 기준으로, 분할 거래의 실제 수익률과 다를 수 있어요.</p></> : <div className="empty-state"><strong>시장·섹터 비교 데이터 없음</strong><p>입력한 거래 기간의 비교 자료를 확인하지 못했어요.</p></div>}</div></Section>
      <Section title="외국인·기관 수급">{context ? <><Row label="외국인"><span className={loss ? 'tone-blue' : 'tone-red'}>{loss ? '-18.4억 원' : '+24억 원'}</span></Row><p className="fine">{loss ? '17거래일 중 8일 순매도' : '17거래일 중 12일 순매수'}</p>
        <Row label="기관">{loss ? '+6.2억 원 · 9일 순매수' : '-11억 원 · 10일 순매도'}</Row>
        <p className="body-copy">수급과 가격 변화가 같은 기간에 관찰됐어요. 투자자의 매매 이유나 가격에 미친 영향은 이 수치만으로 단정하지 않아요. <Source id="F1" /></p></> : <div className="empty-state">해당 기간의 수급 자료를 확인하지 못했어요.</div>}</Section>
      <Section title="공시와 처음의 판단">{context ? <><div className="disclosure-card"><Badge size="small" color="blue" variant="weak">공시 예시</Badge><p>2026.05.19</p><h3>생산설비 투자 진행 현황</h3><p>설비 투자 진행 상황은 담겼지만 수요 증가를 실적으로 확정하는 내용은 아니에요.</p><Source id="D1" /></div>
        <div className="timeline"><p><b>05.06 · 첫 매수</b>{r.buyReason || '매수 근거 미작성'}</p><p><b>05.19 · 공시 예시</b>설비 투자 진행 현황</p><p><b>05.29 · 마지막 매도</b>{r.sellReason || '매도 근거 미작성'}</p></div><Source id="T1" /><Source id="D1" /></> : <div className="empty-state"><strong>관련 공시를 확인하지 못함</strong><p>공시와 거래 이유를 임의로 연결하지 않았어요.</p></div>}</Section>
      <Section title="03 · 가능한 해석"><div className="interpretation"><Badge size="small" color="elephant" variant="weak">{context ? '정황 근거' : '자료 부족'}</Badge><h3>{context ? '시장 흐름과 내 판단을 나눠 보기' : '결과만으로 판단을 평가하지 않아요'}</h3>
        <p>{context ? '섹터의 움직임과 수급은 거래 결과와 함께 관찰된 흐름이에요. 공시가 수익이나 손실의 직접 원인이었다고 결론 내리기에는 근거가 부족해요.' : '손익은 계산할 수 있지만, 시장·수급·공시 자료 없이 왜 그 결과가 발생했는지는 설명하지 않았어요.'}</p><Source id="T1" />{context && <><Source id="M1" /><Source id="F1" /><Source id="D1" /></>}</div></Section>
      <Section title="내 판단으로 남겨둘 부분"><div id="judgment" className="judgment-card"><span className="eyebrow">다음 기록을 위한 질문</span><h3>처음 세운 기준과 거래를 마친 이유는<br />어떻게 연결되어 있나요?</h3>
        <p><b>확인된 사실</b><br />{r.buyReason && r.sellReason ? '매수와 매도 근거를 모두 남겼고, ' : '작성하지 않은 근거가 있으며, '}거래 결과는 {signed(x.realizedRate)}%예요. <Source id="T1" /></p>
        <p><b>직접 판단할 부분</b><br />수익률만으로 당시 기준이 충족됐는지 알 수 없어요. 위에 남긴 근거와 당시 확인한 정보를 함께 돌아보세요.</p></div></Section>
      <div className="underline-card"><span>이번 거래의 밑줄</span><p>결과를 아는 지금,<br />그때의 기준도 함께 기억해요.</p></div>
      <Section title="이번 리포트의 용어"><details><summary>평단가 · 실현손익 · %p{context ? ' · 순매수 · 공시' : ''}</summary><dl className="glossary"><dt>평단가</dt><dd>수량을 반영해 계산한 주당 평균 거래 가격.</dd><dt>실현손익</dt><dd>매도한 주식의 매도금액에서 해당 주식의 매수원가를 뺀 금액.</dd><dt>%p</dt><dd>두 수익률 사이의 차이를 나타내는 단위.</dd>{context && <><dt>순매수</dt><dd>매수금액에서 매도금액을 뺀 값.</dd><dt>공시</dt><dd>기업이 중요한 사실을 공식적으로 알리는 문서.</dd></>}</dl></details></Section>
      <Section title="출처와 분석 기준"><div id="sources" className="sources"><div id="source-T1"><b>T1 · {r.example ? '가상 거래 시나리오' : '사용자 입력 거래 기록'}</b><p>{x.first} ~ {x.last} · 거래 {r.trades.length}건과 작성한 근거</p><details><summary>기록 원본 보기</summary>{tradeList(false, r.trades)}<p>매수 근거: {r.buyReason || '미작성'}</p><p>매도 근거: {r.sellReason || '미작성'}</p></details></div>
        {context && <><div id="source-M1"><b>M1 · 시장·섹터 비교 예시</b><p>{x.first} ~ {x.last} · 디자인용 가상 수치</p></div><div id="source-F1"><b>F1 · 투자자별 수급 예시</b><p>{x.first} ~ {x.last} · 디자인용 기간 합계</p></div><div id="source-D1"><b>D1 · 생산설비 투자 진행 현황</b><p>2026.05.19 · 가상 공시 · 실제 접수번호 없음</p><details><summary>공시 발췌 예시 보기</summary><p>“생산설비 투자 계획에 따른 진행 상황을 안내합니다.” 수요 증가를 확정하는 실적 수치는 이 예시에 포함되지 않습니다.</p></details></div></>}
        <p className="fine">예시에는 실제 공시 원문 링크가 없어요. 서비스 연결 시 출처별 제공처·날짜·접수번호·원문 링크를 표시할 자리예요.</p></div></Section>
      <p className="source-note">AI 분석은 거래 복기를 위한 참고 자료예요. 미래 가격이나 매수·매도를 추천하지 않아요.</p></>;
  }
  let view: ReactNode;
  if (screen === 'login') view = <div className="login-screen"><div className="brand-lockup">밑줄<span className="brand-line" /></div><Heading sub="직접 남긴 거래 기록에서 나만의 판단을 발견해요.">내 거래를<br />다시 읽는 시간</Heading><div className="login-art"><div className="ai-orb">✦</div><div className="login-caption">숫자 뒤에 남은<br /><strong>나의 생각에 밑줄</strong></div></div><div className="login-buttons">{['카카오', 'Google', '토스'].map((provider, i) => <Button key={provider} display="block" size="large" variant={i === 2 ? 'fill' : 'weak'} onClick={() => go('home')}>{provider}로 시작하기</Button>)}<p className="fine">디자인 미리보기에서는 인증 없이 시작해요.</p></div></div>;
  else if (screen === 'home') view = <><Heading sub="수익률과 함께, 그때의 이유도 돌아봐요.">내 거래가<br />다음 판단의 밑줄이 되도록</Heading><div className="hero-card"><div className="hero-icon">✦</div><p className="eyebrow">AI 판단 리플레이</p><h2>어떤 생각으로<br />사고팔았나요?</h2><p>거래 입력 → 근거 기록 → AI 복기</p><Button size="small" onClick={() => go('search')}>거래 기록하기</Button></div><Section title="나의 판단 리플레이">{reports.length ? reports.map(r => <ListRow key={r.id} border="none" left={<Mark stock={r.stock} />} contents={<ListRow.Texts type="2RowTypeA" top={r.stock.name} bottom={r.example ? '예시 리포트' : metrics(r.trades).first + ' ~ ' + metrics(r.trades).last} />} right={<span className={tone(metrics(r.trades).realizedRate)}>{signed(metrics(r.trades).realizedRate)}%</span>} onClick={() => { setReport(r); go('result'); }} withTouchEffect />) : <div className="empty-state"><strong>첫 기록을 기다리고 있어요</strong><p>분석을 마치면 여기에 리플레이가 모여요.</p></div>}<button className="text-button" onClick={() => demo('profit')}>완성된 리포트 예시 보기 →</button></Section></>;
  else if (screen === 'search') view = <><Heading sub="돌아보고 싶은 국내 주식 거래를 골라 주세요.">어떤 종목을<br />거래했나요?</Heading><div className="inset"><TextField variant="box" aria-label="종목 검색" placeholder="종목명 또는 코드 검색" value={search} onChange={e => setSearch(e.target.value)} /></div><Section title="종목 검색">{stocks.filter(s => (s.name + s.code).toLowerCase().includes(search.trim().toLowerCase())).map(s => <ListRow key={s.code} border="none" left={<Mark stock={s} />} contents={<ListRow.Texts type="2RowTypeA" top={s.name} bottom={s.code + ' · ' + s.sector + ' · 가상 종목'} />} onClick={() => selectStock(s)} withTouchEffect arrowType="right" />)}{!stocks.some(s => (s.name + s.code).toLowerCase().includes(search.trim().toLowerCase())) && <p className="empty">검색 결과가 없어요. 종목명을 다시 확인해 주세요.</p>}</Section></>;
  else if (screen === 'trade') view = <><div className="step-caption">1 / 2 · 거래 기록</div><Heading sub="매수·매도를 한 번씩 추가해 주세요. 같은 날 여러 거래도 기록할 수 있어요.">{stock.name}<br />거래를 모아볼게요</Heading><div className="inset"><Tab size="small" onChange={i => { setSide(i ? '매도' : '매수'); }}><Tab.Item selected={side === '매수'}>매수</Tab.Item><Tab.Item selected={side === '매도'}>매도</Tab.Item></Tab>
      <div className="entry-form"><label className="date-label">거래일<input aria-label="거래일" type="date" value={date} max="2026-09-09" onChange={e => { setDate(e.target.value); setPrice(''); }} /></label>
      <p className="fine">시세 목업 제공일: 2026년 5월 6일, 12일, 19일, 29일</p><div className="date-chips">{['06', '12', '19', '29'].map(d => <button key={d} onClick={() => { setDate('2026-05-' + d); setPrice(''); }}>5월 {Number(d)}일</button>)}</div>
      {date && (q ? <div className="quote-card"><Row label="당일 시가">{money(q.open)}</Row><Row label="당일 종가">{money(q.close)}</Row><p>두 가격 사이에서 입력해 주세요.</p></div> : <div className="empty-state">이 날짜에는 조회 가능한 시세가 없어요.</div>)}
      <TextField variant="box" label="주당 평균 거래 가격" labelOption="sustain" aria-label="평균 거래 가격" suffix="원" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value)} />
      {q && <input aria-label="거래 가격 범위" type="range" min={Math.min(q.open, q.close)} max={Math.max(q.open, q.close)} step="1" value={p >= Math.min(q.open, q.close) && p <= Math.max(q.open, q.close) ? p : q.open} onChange={e => setPrice(e.target.value)} />}
      <TextField variant="box" label="거래 수량" labelOption="sustain" aria-label="거래 수량" suffix="주" inputMode="numeric" value={quantity} onChange={e => setQuantity(e.target.value)} />
      {dirty && error && <p className="field-error" role="alert">{error}</p>}
      {!error && <Row label="거래 금액">{money(p * n)}</Row>}
      <Button display="block" variant="weak" disabled={!!error} onClick={add}>{editing ? '수정 완료' : '+ ' + side + ' 기록 추가'}</Button>
      {dirty && <button className="text-button" onClick={clearForm}>입력 취소</button>}</div></div>
      <Section title={'입력한 거래 ' + trades.length + '건'}>{tradeList(true)}{trades.length > 0 && <p className="fine">매수 {m.buyQty}주 · 매도 {m.sellQty}주 · 잔여 {m.remaining}주</p>}</Section>{!canReview && <p className="source-note">매수와 매도 기록을 각각 한 건 이상 추가하면 요약을 볼 수 있어요.</p>}{dirty && <p className="source-note">입력 중인 거래를 추가하거나 취소한 뒤 다음으로 이동해 주세요.</p>}</>;
  else if (screen === 'summary') view = <><div className="step-caption">2 / 2 · 요약과 근거</div><Heading sub="기록을 확인하고 그때의 생각을 남겨 주세요.">{stock.name}<br />이렇게 거래했어요</Heading><Section title="거래 요약">{summaryMetrics()}<details><summary>거래 {trades.length}건 확인</summary>{tradeList(false)}</details><button className="text-button" onClick={() => go('trade')}>거래 추가·수정하기</button></Section>
      <Section title={<>매수 근거 <span className="optional">선택</span></>}><TextArea variant="box" aria-label="매수 근거" placeholder="어떤 사실이나 기대를 보고 매수했나요?" value={buyReason} onChange={e => setBuyReason(e.target.value)} rows={3} maxLength={500} /><p className="fine">{buyReason.length}/500</p></Section>
      <Section title={<>매도 근거 <span className="optional">선택</span></>}><TextArea variant="box" aria-label="매도 근거" placeholder="처음의 생각이 달라졌나요? 거래를 마친 이유를 남겨 주세요." value={sellReason} onChange={e => setSellReason(e.target.value)} rows={3} maxLength={500} /><p className="fine">{sellReason.length}/500</p></Section><p className="source-note">작성하지 않아도 분석할 수 있어요. 비어 있는 근거는 추정하지 않아요.</p></>;
  else if (screen === 'loading') view = <div className="loading-screen"><div className="loading-orb">{done ? <span className="complete-check">✓</span> : <Loader size="large" />}</div><Heading sub={done ? '확인된 사실과 내 판단을 함께 읽어보세요.' : '잠시만 기다려 주세요. 거래와 관련 자료를 차례로 살펴보고 있어요.'}>{done ? <>판단 리플레이<br />완성!</> : <>AI가 거래를<br />분석하고 있어요</>}</Heading><div className="loading-list" role="status">{stages.map((label, i) => <div className={i < step ? 'done' : i === step ? 'active' : ''} key={label}><span>{i < step ? '✓' : i + 1}</span><p>{label}</p><small>{i < step ? '완료' : i === step ? '진행 중' : '대기'}</small></div>)}</div></div>;
  else if (screen === 'failed') view = <><div className="failure-icon">!</div><Heading sub="이용 횟수는 돌려드렸어요. 입력한 기록과 근거는 그대로 남아 있어요.">잠시 길을 잃었어요</Heading><div className="inset"><p className="info-note">분석 응답이 늦어져 작업을 마치지 못했어요. 잠시 후 다시 시도해 주세요.</p><Button display="block" variant="weak" onClick={() => go('home')}>나중에 다시 보기</Button></div></>;
  else view = report ? resultView(report) : <Heading>아직 완성된 분석이 없어요</Heading>;
  const previous: Partial<Record<Screen, Screen>> = { search: 'home', trade: 'search', summary: 'trade', result: 'home', failed: 'summary' };
  return <div className="design-workspace"><aside className="design-sidebar"><div className="design-label">밑줄 / DESIGN 04</div><h1>거래의 결과에서<br />판단의 이유까지</h1><p>실제 거래 입력부터 판단 리플레이까지.<br />TDS 기반 인터랙티브 디자인.</p><ol className="flow-map"><li>로그인과 종목 선택</li><li>분할 매수·매도 기록</li><li>거래 요약과 선택 근거</li><li>분석 과정과 판단 리플레이</li></ol><div className="design-details"><h2>리포트 예시 미리보기</h2><p>예시 리포트와 직접 입력한 기록은 분리됩니다.</p></div><div className="screen-links">{(['profit', 'loss', 'flat', 'missing', 'failed'] as const).map((kind, i) => <Button key={kind} variant="weak" size="small" onClick={() => demo(kind)}>{['수익', '손실', '0% 수익률', '자료 없음', '분석 실패'][i]}</Button>)}</div><p className="preview-footnote">가상 종목·시세·공시를 사용해요. 로그인과 AI 생성은 목업이며 새로고침하면 기록이 초기화됩니다.</p></aside>
    <main className="app-surface"><details className="preview-tools"><summary>디자인 미리보기 · 예시 데이터</summary><div>{(['profit', 'loss', 'flat', 'missing', 'failed'] as const).map((kind, i) => <button key={kind} onClick={() => demo(kind)}>{['수익 예시', '손실 예시', '0% 예시', '자료 없음', '실패 예시'][i]}</button>)}<button onClick={() => go('home')}>홈</button></div></details>
      {screen !== 'login' && <TopNavigation fixed style={{ position: 'relative', flexShrink: 0 }} content={names[screen]} leading={previous[screen] && screen !== 'failed' ? <TopNavigationBackButton aria-label="뒤로 가기" onClick={() => go(previous[screen]!)} /> : undefined} />}
      <div className="app-scroll" ref={scroll}>{view}{notice && <div className="notice" role="status">{notice}</div>}</div>
      <div className="cta-slot">{screen === 'trade' && <BottomCTA.Single fixed={false} disabled={!canReview || dirty} onClick={() => go('summary')}>거래 요약 보기 · {trades.length}건</BottomCTA.Single>}
        {screen === 'summary' && <BottomCTA.Single fixed={false} disabled={!canReview} onClick={start}>AI 분석 시작하기</BottomCTA.Single>}
        {screen === 'loading' && done && <BottomCTA.Single fixed={false} onClick={() => go('result')}>판단 리플레이 보기</BottomCTA.Single>}
        {screen === 'failed' && <BottomCTA.Single fixed={false} onClick={() => go('loading')}>다시 분석하기</BottomCTA.Single>}
        {screen === 'result' && <BottomCTA.Single fixed={false} onClick={() => go('home')}>내 기록으로 돌아가기</BottomCTA.Single>}</div>
    </main></div>;
}
