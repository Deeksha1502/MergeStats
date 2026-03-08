import { Router, Request, Response } from 'express';
import { fetchPRs, getPRDetails, generateStats } from '../services/github';
import { buildDateRange } from '../utils/dateUtils';
import { validateStatsInput } from '../utils/validate';

const router = Router();

function extractToken(req: Request): string | null {
  const cookieToken = (req as Request & { cookies?: Record<string, string> }).cookies?.github_token;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({ error: 'Not authenticated. Please log in with GitHub.' });
      return;
    }

    console.log('Received request:', req.body);

    if (typeof req.body !== 'object' || req.body === null || Array.isArray(req.body)) {
      res.status(400).json({ error: 'Request body must be a JSON object' });
      return;
    }

    const { username, year, month } = req.body as {
      username: unknown;
      year: unknown;
      month: unknown;
    };

    const validationError = validateStatsInput(username, year, month);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    const monthInt = parseInt(String(month), 10);
    const yearInt = parseInt(String(year), 10);
    const { startDate, endDate, monthStr } = buildDateRange(yearInt, monthInt);

    console.log(
      `Processing request for ${username}, period ${monthStr}/${yearInt} (${startDate} to ${endDate})`
    );

    const prs = await fetchPRs(String(username), startDate, endDate, token);

    if (prs.length === 0) {
      res.json({
        username,
        period: `${monthStr}/${yearInt}`,
        stats: { totalPRs: 0, mergedPRs: 0, closedPRs: 0, openPRs: 0, repos: {} },
        prDetails: [],
      });
      return;
    }

    const prDetails = await getPRDetails(prs, token);
    const stats = generateStats(prDetails);

    res.json({ username, period: `${monthStr}/${yearInt}`, stats, prDetails });
  } catch (error) {
    console.error('API Error:', error);
    const message = (error as Error).message ?? '';
    if (message.includes('Validation Failed') || message.includes('Could not find user')) {
      res.status(404).json({ error: `Could not find GitHub user "${req.body?.username}". Please check the username and try again.` });
      return;
    }
    if (message.includes('Bad credentials')) {
      res.status(401).json({ error: 'Your GitHub session has expired. Please log in again.' });
      return;
    }
    res.status(500).json({ error: message });
  }
});

export default router;
