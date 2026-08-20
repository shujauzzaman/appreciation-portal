// Shared month-key helpers so the client (leaderboard queries) and the
// server (posts/create, when incrementing monthlyPoints) always agree on
// how a given date is bucketed. Keys are UTC-based ("YYYY-MM") so they
// don't drift with the server's timezone or a visitor's local timezone.

export function getMonthKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// The 3 month keys making up the calendar quarter containing `date`.
export function getQuarterMonthKeys(date = new Date()) {
  const year = date.getUTCFullYear();
  const quarterStartMonth = Math.floor(date.getUTCMonth() / 3) * 3; // 0, 3, 6, 9
  return [0, 1, 2].map((i) => {
    const m = quarterStartMonth + i + 1;
    return `${year}-${String(m).padStart(2, "0")}`;
  });
}

// The 12 month keys making up the calendar year containing `date`.
export function getYearMonthKeys(date = new Date()) {
  const year = date.getUTCFullYear();
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}
