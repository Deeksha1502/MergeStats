import axios from 'axios';
import type { StatsResponse } from '../types/stats';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export async function fetchStats(
  username: string,
  year: number | string,
  month: number | string
): Promise<StatsResponse> {
  const { data } = await axios.post<StatsResponse>(`${BASE_URL}/api/stats`, {
    username,
    year,
    month,
  });
  return data;
}
