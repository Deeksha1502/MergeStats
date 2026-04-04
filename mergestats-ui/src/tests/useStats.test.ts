import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStats } from '../hooks/useStats';
import { fetchStats } from '../api/statsApi';
import type { StatsResponse } from '../types/stats';

vi.mock('../api/statsApi');
const mockFetchStats = vi.mocked(fetchStats);

const mockResponse: StatsResponse = {
  username: 'octocat',
  period: '03/2024',
  stats: {
    totalPRs: 5,
    mergedPRs: 3,
    closedPRs: 1,
    openPRs: 1,
    repos: { 'org/repo': { total: 5, merged: 3 } },
  },
  prDetails: [],
};

describe('useStats', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('loading state', () => {
    it('starts in loading state', () => {
      mockFetchStats.mockResolvedValueOnce(mockResponse);
      const { result } = renderHook(() => useStats('octocat', 2024, 3));
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('success', () => {
    it('returns data and clears loading on success', async () => {
      mockFetchStats.mockResolvedValueOnce(mockResponse);
      const { result } = renderHook(() => useStats('octocat', 2024, 3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('calls fetchStats with correct arguments', async () => {
      mockFetchStats.mockResolvedValueOnce(mockResponse);
      renderHook(() => useStats('torvalds', 2023, 11));

      await waitFor(() => expect(mockFetchStats).toHaveBeenCalledTimes(1));
      expect(mockFetchStats).toHaveBeenCalledWith('torvalds', 2023, 11);
    });
  });

  describe('error handling', () => {
    it('sets error message from API response', async () => {
      mockFetchStats.mockRejectedValueOnce({
        response: { data: { error: 'Rate limit exceeded' } },
      });
      const { result } = renderHook(() => useStats('octocat', 2024, 3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Rate limit exceeded');
      expect(result.current.data).toBeNull();
    });

    it('falls back to generic error message when no API error field', async () => {
      mockFetchStats.mockRejectedValueOnce(new Error('Network error'));
      const { result } = renderHook(() => useStats('octocat', 2024, 3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Failed to fetch data');
    });
  });

  describe('missing params', () => {
    it('sets error and stops loading when username is undefined', async () => {
      const { result } = renderHook(() => useStats(undefined, 2024, 3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Missing required parameters');
      expect(mockFetchStats).not.toHaveBeenCalled();
    });

    it('sets error when year is undefined', async () => {
      const { result } = renderHook(() => useStats('octocat', undefined, 3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Missing required parameters');
    });

    it('succeeds in year-only mode when month is undefined', async () => {
      mockFetchStats.mockResolvedValueOnce(mockResponse);
      const { result } = renderHook(() => useStats('octocat', 2024, undefined));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBeNull();
      expect(result.current.data).toEqual(mockResponse);
      expect(mockFetchStats).toHaveBeenCalledWith('octocat', 2024, undefined);
    });
  });
});
