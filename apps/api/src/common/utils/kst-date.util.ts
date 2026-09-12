export function getYesterdayKstBasDt(): string {
  const now = new Date();
  const kstNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }),
  );
  kstNow.setDate(kstNow.getDate() - 1);

  const year = kstNow.getFullYear();
  const month = String(kstNow.getMonth() + 1).padStart(2, '0');
  const day = String(kstNow.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
