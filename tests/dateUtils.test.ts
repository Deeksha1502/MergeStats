import { getLastDayOfMonth, buildDateRange } from '../utils/dateUtils';

describe('getLastDayOfMonth', () => {
  it('returns 31 for January', () => {
    expect(getLastDayOfMonth(2024, 1)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(getLastDayOfMonth(2023, 2)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(getLastDayOfMonth(2024, 2)).toBe(29);
  });

  it('returns 30 for April', () => {
    expect(getLastDayOfMonth(2024, 4)).toBe(30);
  });

  it('returns 31 for December', () => {
    expect(getLastDayOfMonth(2024, 12)).toBe(31);
  });
});

describe('buildDateRange', () => {
  it('builds correct date range for January 2024', () => {
    const result = buildDateRange(2024, 1);
    expect(result).toEqual({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      monthStr: '01',
    });
  });

  it('builds correct date range for February 2024 (leap year)', () => {
    const result = buildDateRange(2024, 2);
    expect(result).toEqual({
      startDate: '2024-02-01',
      endDate: '2024-02-29',
      monthStr: '02',
    });
  });

  it('pads single-digit months with a leading zero', () => {
    const result = buildDateRange(2024, 3);
    expect(result.monthStr).toBe('03');
    expect(result.startDate).toBe('2024-03-01');
  });

  it('builds correct date range for December', () => {
    const result = buildDateRange(2024, 12);
    expect(result).toEqual({
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      monthStr: '12',
    });
  });
});
