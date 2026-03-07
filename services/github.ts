import { githubFetch } from '../utils/githubClient';
import { RawPR, PRDetail, Stats, GitHubSearchResult, GitHubPRResult } from '../types';

export async function fetchPRs(
  username: string,
  startDate: string,
  endDate: string,
  page = 1,
  allPRs: RawPR[] = []
): Promise<RawPR[]> {
  const url = `https://api.github.com/search/issues?q=type:pr+author:${username}+created:${startDate}..${endDate}&per_page=100&page=${page}`;
  console.log(`Fetching page ${page}...`);

  const data = await githubFetch<GitHubSearchResult>(url);

  if (!data.items || data.items.length === 0) {
    console.log(`No PRs found for user ${username} in the given time period.`);
    return allPRs;
  }

  const combinedPRs = [...allPRs, ...data.items];

  if (data.items.length === 100 && page < 10) {
    return fetchPRs(username, startDate, endDate, page + 1, combinedPRs);
  }

  return combinedPRs;
}

export async function getPRDetails(prs: RawPR[]): Promise<PRDetail[]> {
  const prDetails: PRDetail[] = [];

  for (let i = 0; i < prs.length; i++) {
    const pr = prs[i];
    try {
      console.log(`Fetching details for PR ${i + 1}/${prs.length}: ${pr.title}`);

      const repoFullName = pr.repository_url.split('/repos/')[1];
      const prUrl = `https://api.github.com/repos/${repoFullName}/pulls/${pr.number}`;

      const prData = await githubFetch<GitHubPRResult>(prUrl);

      prDetails.push({
        title: pr.title,
        number: pr.number,
        repo: repoFullName,
        merged: prData.merged === true,
        state: prData.state,
        created_at: pr.created_at,
        merged_at: prData.merged_at,
        closed_at: prData.closed_at,
        url: pr.html_url,
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing PR ${pr.number}:`, (error as Error).message);
    }
  }

  return prDetails;
}

export function generateStats(prDetails: PRDetail[]): Stats {
  const repos: Record<string, { total: number; merged: number }> = {};

  for (const pr of prDetails) {
    if (!repos[pr.repo]) {
      repos[pr.repo] = { total: 0, merged: 0 };
    }
    repos[pr.repo].total++;
    if (pr.merged) repos[pr.repo].merged++;
  }

  return {
    totalPRs: prDetails.length,
    mergedPRs: prDetails.filter(pr => pr.merged).length,
    closedPRs: prDetails.filter(pr => !pr.merged && pr.state === 'closed').length,
    openPRs: prDetails.filter(pr => pr.state === 'open').length,
    repos,
  };
}
