export function validateStatsInput(
  username: unknown,
  year: unknown,
  month: unknown
): string | null {
  if (
    username === undefined || username === null || username === '' ||
    year === undefined || year === null || year === '' ||
    month === undefined || month === null || month === ''
  ) {
    return 'Missing required parameters';
  }

  const monthInt = parseInt(String(month), 10);
  if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
    return 'Invalid month. Please enter a number between 1 and 12.';
  }

  const yearInt = parseInt(String(year), 10);
  if (isNaN(yearInt) || yearInt < 2000 || yearInt > new Date().getFullYear()) {
    return 'Invalid year.';
  }

  return null;
}
