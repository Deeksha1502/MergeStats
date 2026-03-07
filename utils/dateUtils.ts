import { DateRange } from '../types';

export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function buildDateRange(year: number, month: number): DateRange {
  const monthStr = month.toString().padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const lastDay = getLastDayOfMonth(year, month);
  const endDate = `${year}-${monthStr}-${lastDay}`;
  return { startDate, endDate, monthStr };
}
