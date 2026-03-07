import { generateStats, getPRDetails, fetchPRs } from '../services/github';
import { PRDetail, RawPR } from '../types';

// Mock the githubFetch utility so tests don't make real HTTP requests
jest.mock('../utils/githubClient');
import { githubFetch } from '../utils/githubClient';
const mockGithubFetch = githubFetch as jest.MockedFunction<typeof githubFetch>;

// ─── generateStats ────────────────────────────────────────────────────────────

describe('generateStats', () => {
  const base: PRDetail = {
    title: 'Test PR',
    number: 1,
    repo: 'org/repo',
    merged: false,
    state: 'open',
    created_at: '2024-01-01T00:00:00Z',
    merged_at: null,
    closed_at: null,
    url: 'https://github.com/org/repo/pull/1',
  };

  it('counts totalPRs correctly', () => {
    const prs = [base, { ...base, number: 2 }];
    expect(generateStats(prs).totalPRs).toBe(2);
  });

  it('counts merged PRs correctly', () => {
    const prs = [
      { ...base, merged: true, state: 'closed' },
      { ...base, number: 2, merged: false, state: 'closed' },
    ];
    expect(generateStats(prs).mergedPRs).toBe(1);
  });

  it('counts closed (not merged) PRs correctly', () => {
    const prs = [
      { ...base, merged: false, state: 'closed' },
      { ...base, number: 2, merged: true, state: 'closed' },
    ];
    expect(generateStats(prs).closedPRs).toBe(1);
  });

  it('counts open PRs correctly', () => {
    const prs = [
      { ...base, state: 'open' },
      { ...base, number: 2, merged: true, state: 'closed' },
    ];
    expect(generateStats(prs).openPRs).toBe(1);
  });

  it('groups PRs by repo', () => {
    const prs: PRDetail[] = [
      { ...base, repo: 'org/repo-a', merged: true, state: 'closed' },
      { ...base, number: 2, repo: 'org/repo-a', merged: false, state: 'open' },
      { ...base, number: 3, repo: 'org/repo-b', merged: true, state: 'closed' },
    ];
    const stats = generateStats(prs);
    expect(stats.repos['org/repo-a']).toEqual({ total: 2, merged: 1 });
    expect(stats.repos['org/repo-b']).toEqual({ total: 1, merged: 1 });
  });

  it('returns zeros for empty input', () => {
    const stats = generateStats([]);
    expect(stats).toEqual({ totalPRs: 0, mergedPRs: 0, closedPRs: 0, openPRs: 0, repos: {} });
  });
});

// ─── getPRDetails ─────────────────────────────────────────────────────────────

describe('getPRDetails', () => {
  const rawPR: RawPR = {
    title: 'Fix bug',
    number: 42,
    repository_url: 'https://api.github.com/repos/org/repo',
    created_at: '2024-03-01T10:00:00Z',
    html_url: 'https://github.com/org/repo/pull/42',
  };

  beforeEach(() => jest.clearAllMocks());

  it('maps a merged PR correctly', async () => {
    mockGithubFetch.mockResolvedValueOnce({
      merged: true,
      state: 'closed',
      merged_at: '2024-03-02T10:00:00Z',
      closed_at: '2024-03-02T10:00:00Z',
    });

    const details = await getPRDetails([rawPR]);

    expect(details).toHaveLength(1);
    expect(details[0]).toMatchObject({
      title: 'Fix bug',
      number: 42,
      repo: 'org/repo',
      merged: true,
      state: 'closed',
    });
  });

  it('maps an open PR correctly', async () => {
    mockGithubFetch.mockResolvedValueOnce({
      merged: false,
      state: 'open',
      merged_at: null,
      closed_at: null,
    });

    const details = await getPRDetails([rawPR]);
    expect(details[0].merged).toBe(false);
    expect(details[0].state).toBe('open');
  });

  it('skips a PR when githubFetch throws', async () => {
    mockGithubFetch.mockRejectedValueOnce(new Error('Rate limit'));
    const details = await getPRDetails([rawPR]);
    expect(details).toHaveLength(0);
  });

  it('processes multiple PRs, skipping failed ones', async () => {
    const pr2: RawPR = { ...rawPR, number: 43 };
    mockGithubFetch
      .mockResolvedValueOnce({ merged: true, state: 'closed', merged_at: null, closed_at: null })
      .mockRejectedValueOnce(new Error('Not found'));

    const details = await getPRDetails([rawPR, pr2]);
    expect(details).toHaveLength(1);
    expect(details[0].number).toBe(42);
  });
});

// ─── fetchPRs ─────────────────────────────────────────────────────────────────

describe('fetchPRs', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty array when no items found', async () => {
    mockGithubFetch.mockResolvedValueOnce({ items: [], total_count: 0 });
    const prs = await fetchPRs('octocat', '2024-01-01', '2024-01-31');
    expect(prs).toEqual([]);
  });

  it('returns items from a single page', async () => {
    const item: RawPR = {
      title: 'PR 1',
      number: 1,
      repository_url: 'https://api.github.com/repos/org/repo',
      created_at: '2024-01-10T00:00:00Z',
      html_url: 'https://github.com/org/repo/pull/1',
    };
    mockGithubFetch.mockResolvedValueOnce({ items: [item], total_count: 1 });
    const prs = await fetchPRs('octocat', '2024-01-01', '2024-01-31');
    expect(prs).toHaveLength(1);
    expect(prs[0].title).toBe('PR 1');
  });

  it('fetches a second page when first page has 100 items', async () => {
    const page1Items = Array.from({ length: 100 }, (_, i) => ({
      title: `PR ${i}`,
      number: i,
      repository_url: 'https://api.github.com/repos/org/repo',
      created_at: '2024-01-01T00:00:00Z',
      html_url: `https://github.com/org/repo/pull/${i}`,
    }));
    const page2Item: RawPR = {
      title: 'PR 100',
      number: 100,
      repository_url: 'https://api.github.com/repos/org/repo',
      created_at: '2024-01-01T00:00:00Z',
      html_url: 'https://github.com/org/repo/pull/100',
    };

    mockGithubFetch
      .mockResolvedValueOnce({ items: page1Items, total_count: 101 })
      .mockResolvedValueOnce({ items: [page2Item], total_count: 101 });

    const prs = await fetchPRs('octocat', '2024-01-01', '2024-01-31');
    expect(prs).toHaveLength(101);
    expect(mockGithubFetch).toHaveBeenCalledTimes(2);
  });

  it('throws when githubFetch throws', async () => {
    mockGithubFetch.mockRejectedValueOnce(new Error('GitHub API error: Bad credentials'));
    await expect(fetchPRs('octocat', '2024-01-01', '2024-01-31')).rejects.toThrow(
      'GitHub API error: Bad credentials'
    );
  });
});
