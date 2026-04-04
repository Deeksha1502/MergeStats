import { useState, useEffect } from 'react';
import { fetchStats } from '../api/statsApi';
import type { StatsResponse } from '../types/stats';

interface UseStatsResult {
  data: StatsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useStats(
  username: string | undefined,
  year: number | string | undefined,
  month: number | string | undefined
): UseStatsResult {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !year) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }

    fetchStats(username, year, month)
      .then(setData)
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error ?? 'Failed to fetch data');
      })
      .finally(() => setLoading(false));
  }, [username, year, month]);

  return { data, loading, error };
}
