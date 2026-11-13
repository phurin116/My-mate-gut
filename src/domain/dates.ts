import type { ISODate } from './types';

const DAY = 86_400_000;

export function nowISO(): ISODate {
  return new Date().toISOString();
}

/** ISO timestamp `days` from now (negative for the past), at a fixed hour so seeds are stable. */
export function daysFromNow(days: number, hour = 9): ISODate {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole calendar days from today until `iso`. 0 = today, negative = past. */
export function daysUntil(iso: ISODate): number {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / DAY);
}

export function daysSince(iso: ISODate): number {
  return -daysUntil(iso);
}

/**
 * Dates are formatted with Intl so a future Thai locale only needs a different
 * locale tag here, not changes in components.
 */
let localeTag = 'en-GB';
export function setDateLocale(tag: string) {
  localeTag = tag;
}

export function formatDate(iso: ISODate): string {
  return new Intl.DateTimeFormat(localeTag, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function formatDateShort(iso: ISODate): string {
  return new Intl.DateTimeFormat(localeTag, { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function formatDateTime(iso: ISODate): string {
  return new Intl.DateTimeFormat(localeTag, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatMonthYear(iso: ISODate): string {
  return new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric' }).format(new Date(iso));
}

export function formatBaht(amount: number): string {
  return '฿' + new Intl.NumberFormat(localeTag).format(amount);
}

/** Value for <input type="datetime-local"> from an ISO string. */
export function toLocalInput(iso: ISODate): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateInput(iso: ISODate): string {
  return toLocalInput(iso).slice(0, 10);
}
