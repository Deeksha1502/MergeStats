import fetch, { Response } from 'node-fetch';

function buildHeaders(token: string): Record<string, string> {
  return {
    Authorization: `token ${token}`,
    'User-Agent': 'mergestats-script',
  };
}

function checkRateLimit(response: Response): void {
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining === '0') {
    const resetTs = response.headers.get('x-ratelimit-reset');
    const resetEpoch = Number(resetTs);
    if (resetTs !== null && !Number.isNaN(resetEpoch) && resetEpoch > 0) {
      const reset = new Date(resetEpoch * 1000);
      throw new Error(`GitHub API rate limit exceeded. Try again after ${reset.toLocaleTimeString()}`);
    }
    throw new Error('GitHub API rate limit exceeded. Try again later.');
  }
}

export async function githubFetch<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, { headers: buildHeaders(token) });
  checkRateLimit(response);

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status} ${response.statusText}`);
    }
    throw new Error('Expected JSON response from GitHub API');
  }

  let data: T & { message?: string };
  try {
    data = (await response.json()) as T & { message?: string };
  } catch {
    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status} ${response.statusText}`);
    }
    throw new Error('Failed to parse JSON response from GitHub API');
  }

  if (!response.ok) {
    throw new Error(data.message ? `GitHub API error: ${data.message}` : `GitHub API request failed with status ${response.status} ${response.statusText}`);
  }

  return data;
}
