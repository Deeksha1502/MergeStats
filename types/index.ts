export interface RawPR {
  title: string;
  number: number;
  repository_url: string;
  created_at: string;
  html_url: string;
}

export interface PRDetail {
  title: string;
  number: number;
  repo: string;
  merged: boolean;
  state: string;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  url: string;
}

export interface RepoStats {
  total: number;
  merged: number;
}

export interface Stats {
  totalPRs: number;
  mergedPRs: number;
  closedPRs: number;
  openPRs: number;
  repos: Record<string, RepoStats>;
}

export interface StatsResponse {
  username: string;
  period: string;
  stats: Stats;
  prDetails: PRDetail[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
  monthStr: string;
}

export interface GitHubSearchResult {
  items: RawPR[];
  total_count: number;
  message?: string;
}

export interface GitHubPRResult {
  merged: boolean;
  state: string;
  merged_at: string | null;
  closed_at: string | null;
  message?: string;
}
