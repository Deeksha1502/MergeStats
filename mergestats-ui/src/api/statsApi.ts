import axios from 'axios';
import type { StatsResponse } from '../types/stats';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export async function fetchStats(
  username: string,
  year: number | string,
  month: number | string
): Promise<StatsResponse> {
  const { data } = await api.post<StatsResponse>('/api/stats', {
    username,
    year,
    month,
  });
  return data;
}
