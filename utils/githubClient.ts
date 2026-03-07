import fetch, { Response } from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const headers: Record<string, string> = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'mergestats-script',
};

function checkRateLimit(response: Response): void {
  const remaining = response.headers.get('x-ratelimit-remaining');
  if (remaining === '0') {
    const resetTs = response.headers.get('x-ratelimit-reset');
    const reset = new Date(Number(resetTs) * 1000);
    throw new Error(
      `GitHub API rate limit exceeded. Try again after ${reset.toLocaleTimeString()}`
    );
  }
}

export async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers });
  checkRateLimit(response);

  const data = (await response.json()) as T & { message?: string };

  if (data.message) {
    throw new Error(`GitHub API error: ${data.message}`);
  }

  return data;
}
