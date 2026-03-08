export interface LocationState {
  username: string;
  year: number;
  month: number;
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

export interface PRStats {
  totalPRs: number;
  mergedPRs: number;
  closedPRs: number;
  openPRs: number;
  repos: Record<string, RepoStats>;
}

export interface StatsResponse {
  username: string;
  period: string;
  stats: PRStats;
  prDetails: PRDetail[];
}

export interface GitHubAuthUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export interface AuthState {
  authenticated: boolean;
  user: GitHubAuthUser | null;
  loading: boolean;
}
