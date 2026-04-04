// GitHub username rules: 1-39 chars, alphanumeric or hyphens, no leading/trailing/consecutive hyphens
const GITHUB_USERNAME_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/;
const INTEGER_RE = /^\d+$/;

export function validateStatsInput(
  username: unknown,
  year: unknown,
  month: unknown
): string | null {
  if (
    username === undefined || username === null || username === '' ||
    year === undefined || year === null || year === ''
  ) {
    return 'Missing required parameters';
  }

  const usernameStr = String(username).trim();
  if (!GITHUB_USERNAME_RE.test(usernameStr) || usernameStr.includes('--')) {
    return 'Invalid GitHub username.';
  }

  const yearStr = String(year);
  if (!INTEGER_RE.test(yearStr)) {
    return 'Invalid year.';
  }
  const yearInt = parseInt(yearStr, 10);
  if (yearInt < 2000 || yearInt > new Date().getFullYear()) {
    return 'Invalid year.';
  }

  // Month is optional — when omitted the full year is queried
  if (month !== undefined && month !== null && month !== '') {
    const monthStr = String(month);
    if (!INTEGER_RE.test(monthStr)) {
      return 'Invalid month. Please enter a number between 1 and 12.';
    }
    const monthInt = parseInt(monthStr, 10);
    if (monthInt < 1 || monthInt > 12) {
      return 'Invalid month. Please enter a number between 1 and 12.';
    }
  }

  return null;
}
