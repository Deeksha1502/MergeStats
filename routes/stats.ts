import { Router, Request, Response } from 'express';
import { fetchPRs, getPRDetails, generateStats } from '../services/github';
import { buildDateRange } from '../utils/dateUtils';
import { validateStatsInput } from '../utils/validate';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
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

    const prs = await fetchPRs(String(username), startDate, endDate);

    if (prs.length === 0) {
      res.json({
        username,
        period: `${monthStr}/${yearInt}`,
        stats: { totalPRs: 0, mergedPRs: 0, closedPRs: 0, openPRs: 0, repos: {} },
        prDetails: [],
      });
      return;
    }

    const prDetails = await getPRDetails(prs);
    const stats = generateStats(prDetails);

    res.json({ username, period: `${monthStr}/${yearInt}`, stats, prDetails });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
