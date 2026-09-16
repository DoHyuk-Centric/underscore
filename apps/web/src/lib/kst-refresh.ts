const REFRESH_HOUR_KST = 14;
const BUFFER_MINUTES = 5;

export function getNextKstRefreshTimestamp(from: number = Date.now()): number {
  const kstNow = new Date(
    new Date(from).toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );

  const target = new Date(kstNow);
  target.setHours(REFRESH_HOUR_KST, BUFFER_MINUTES, 0, 0);

  if (target.getTime() <= kstNow.getTime()) {
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - kstNow.getTime();
  return from + diffMs;
}
