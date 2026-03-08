import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchStats } from '../api/statsApi';
import type { StatsResponse } from '../types/stats';

// vi.hoisted ensures mockPost is available when vi.mock runs (since vi.mock is hoisted)
const mockPost = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({ post: mockPost })),
  },
}));

const mockResponse: StatsResponse = {
  username: 'octocat',
  period: '03/2024',
  stats: {
    totalPRs: 2,
    mergedPRs: 1,
    closedPRs: 1,
    openPRs: 0,
    repos: {},
  },
  prDetails: [],
};

describe('fetchStats', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls POST /api/stats with correct payload', async () => {
    mockPost.mockResolvedValueOnce({ data: mockResponse });

    await fetchStats('octocat', 2024, 3);

    expect(mockPost).toHaveBeenCalledWith('/api/stats', {
      username: 'octocat',
      year: 2024,
      month: 3,
    });
  });

  it('returns the response data', async () => {
    mockPost.mockResolvedValueOnce({ data: mockResponse });

    const result = await fetchStats('octocat', 2024, 3);

    expect(result).toEqual(mockResponse);
  });

  it('accepts string year and month', async () => {
    mockPost.mockResolvedValueOnce({ data: mockResponse });

    await fetchStats('octocat', '2024', '3');

    expect(mockPost).toHaveBeenCalledWith('/api/stats', {
      username: 'octocat',
      year: '2024',
      month: '3',
    });
  });

  it('propagates axios errors to the caller', async () => {
    const axiosError = { response: { data: { error: 'GitHub rate limit' }, status: 500 } };
    mockPost.mockRejectedValueOnce(axiosError);

    await expect(fetchStats('octocat', 2024, 3)).rejects.toEqual(axiosError);
  });

  it('propagates network errors to the caller', async () => {
    mockPost.mockRejectedValueOnce(new Error('Network Error'));

    await expect(fetchStats('octocat', 2024, 3)).rejects.toThrow('Network Error');
  });
});
