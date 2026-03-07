import { validateStatsInput } from '../utils/validate';

describe('validateStatsInput', () => {
  describe('missing fields', () => {
    it('returns error when username is missing', () => {
      expect(validateStatsInput('', 2024, 1)).toBe('Missing required parameters');
    });

    it('returns error when year is missing', () => {
      expect(validateStatsInput('octocat', '', 1)).toBe('Missing required parameters');
    });

    it('returns error when month is missing', () => {
      expect(validateStatsInput('octocat', 2024, '')).toBe('Missing required parameters');
    });

    it('returns error when all fields are missing', () => {
      expect(validateStatsInput('', '', '')).toBe('Missing required parameters');
    });
  });

  describe('month validation', () => {
    it('returns error for month 0', () => {
      expect(validateStatsInput('octocat', 2024, 0)).toMatch(/Invalid month/);
    });

    it('returns error for month 13', () => {
      expect(validateStatsInput('octocat', 2024, 13)).toMatch(/Invalid month/);
    });

    it('returns error for non-numeric month', () => {
      expect(validateStatsInput('octocat', 2024, 'abc')).toMatch(/Invalid month/);
    });

    it('accepts valid months 1-12', () => {
      for (let m = 1; m <= 12; m++) {
        expect(validateStatsInput('octocat', 2024, m)).toBeNull();
      }
    });
  });

  describe('year validation', () => {
    it('returns error for year before 2000', () => {
      expect(validateStatsInput('octocat', 1999, 1)).toMatch(/Invalid year/);
    });

    it('returns error for year after current year', () => {
      const future = new Date().getFullYear() + 1;
      expect(validateStatsInput('octocat', future, 1)).toMatch(/Invalid year/);
    });

    it('returns error for non-numeric year', () => {
      expect(validateStatsInput('octocat', 'xyz', 1)).toMatch(/Invalid year/);
    });

    it('accepts year 2000', () => {
      expect(validateStatsInput('octocat', 2000, 6)).toBeNull();
    });

    it('accepts current year', () => {
      expect(validateStatsInput('octocat', new Date().getFullYear(), 1)).toBeNull();
    });
  });

  describe('valid input', () => {
    it('returns null for valid username, year, and month', () => {
      expect(validateStatsInput('torvalds', 2023, 11)).toBeNull();
    });

    it('accepts string numbers for year and month', () => {
      expect(validateStatsInput('octocat', '2023', '6')).toBeNull();
    });
  });
});
