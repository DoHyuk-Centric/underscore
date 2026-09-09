export type Side = '매수' | '매도';
export type Trade = { id: string; side: Side; date: string; price: number; quantity: number };
export const stocks = [
  { name: '가온테크', code: 'DEMO01', sector: '반도체 장비', base: 70000 },
  { name: '해솔바이오', code: 'DEMO02', sector: '바이오', base: 48000 },
  { name: '미래에너지', code: 'DEMO03', sector: '에너지', base: 42000 },
];
export type Stock = typeof stocks[number];
export const money = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
export const signed = (n: number, digits = 1) => `${n > 0 ? '+' : ''}${n.toFixed(digits)}`;
export const tone = (n: number) => n > 0 ? 'tone-red' : n < 0 ? 'tone-blue' : '';
export function quote(stock: Stock, date: string) {
  if (!/^2026-05-(06|12|19|29)$/.test(date)) return null;
  const factor = { '06': 1, '12': 1.01, '19': 1.045, '29': 1.085 }[date.slice(-2)] ?? 1;
  const center = Math.round(stock.base * factor / 100) * 100;
  return { open: center - 700, close: center + 800 };
}
export function chronologyError(trades: Trade[]) {
  let balance = 0;
  for (const t of [...trades].sort((a, b) => a.date.localeCompare(b.date))) {
    balance += t.side === '매수' ? t.quantity : -t.quantity;
    if (balance < 0) return `${t.date} 매도 수량이 그때까지 매수한 수량보다 많아요. 같은 날 거래는 입력 순서로 계산해요.`;
  }
  return '';
}
export function metrics(trades: Trade[]) {
  const ordered = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  const buys = ordered.filter(t => t.side === '매수'), sells = ordered.filter(t => t.side === '매도');
  const qty = (ts: Trade[]) => ts.reduce((s, t) => s + t.quantity, 0);
  const amount = (ts: Trade[]) => ts.reduce((s, t) => s + t.price * t.quantity, 0);
  const buyQty = qty(buys), sellQty = qty(sells);
  const lots: { price: number; quantity: number }[] = [];
  let cost = 0;
  for (const t of ordered) {
    if (t.side === '매수') lots.push({ price: t.price, quantity: t.quantity });
    else { let remaining = t.quantity; for (const lot of lots) { const take = Math.min(lot.quantity, remaining); cost += take * lot.price; lot.quantity -= take; remaining -= take; if (!remaining) break; } }
  }
  const pnl = amount(sells) - cost;
  const first = buys[0]?.date ?? '', last = sells.at(-1)?.date ?? '';
  return { buyQty, sellQty, remaining: buyQty - sellQty, buyAvg: buyQty ? amount(buys) / buyQty : 0, sellAvg: sellQty ? amount(sells) / sellQty : 0,
    pnl, realizedRate: cost ? pnl / cost * 100 : 0,
    averageRate: sellQty && buyQty ? (amount(sells) / sellQty / (amount(buys) / buyQty) - 1) * 100 : 0,
    first, last, days: first && last ? Math.round((Date.parse(last) - Date.parse(first)) / 86400000) : 0 };
}
