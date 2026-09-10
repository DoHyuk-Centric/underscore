export function getYesterdayKstBasDt(): string {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  kstNow.setUTCDate(kstNow.getUTCDate() - 1);
  const yyyy = kstNow.getUTCFullYear();
  const mm = String(kstNow.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kstNow.getUTCDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}
