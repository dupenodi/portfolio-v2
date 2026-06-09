const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/** Parse YYYY-MM-DD (and datetime prefixes) in local time — avoids UTC timezone shifts. */
export function parseLocalDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** format date like `dec 27, 2025` */
export function formatPostDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

/** `jun 2022` */
export function formatMonthYear(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Trip date line — month-level, collapses sensibly:
 * - start only → `may 2026`
 * - same month → `may 2026`
 * - same year → `may – jun 2026`
 * - different years → `dec 2025 – jan 2026`
 */
export function formatTripDates(startStr: string, endStr?: string): string {
  const start = parseLocalDate(startStr);
  if (!start) return "";

  const end = endStr?.trim() ? parseLocalDate(endStr) : null;
  const startMonth = MONTHS[start.getMonth()];
  const startYear = start.getFullYear();

  if (!end || end.getTime() < start.getTime()) {
    return `${startMonth} ${startYear}`;
  }

  const endMonth = MONTHS[end.getMonth()];
  const endYear = end.getFullYear();

  if (startYear === endYear && start.getMonth() === end.getMonth()) {
    return `${startMonth} ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startMonth} – ${endMonth} ${startYear}`;
  }

  return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
}

/** `jun'26` — matches prototype gutter width */
export function formatPostDateShort(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  if (!d) return "";
  const month = MONTHS[d.getMonth()];
  const year = String(d.getFullYear()).slice(-2);
  return `${month}'${year}`;
}
