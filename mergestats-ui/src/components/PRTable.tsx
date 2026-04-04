import type { PRDetail } from '../types/stats';
import { PRStatusBadge } from './PRStatusBadge';

interface Props {
  prDetails: PRDetail[];
}

export function PRTable({ prDetails }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none backdrop-blur-sm transition-colors duration-200">
      <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-100">PR Details</h2>

      {/* ── Mobile card list (hidden on sm+) ── */}
      <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60 sm:hidden">
        {prDetails.map((pr, index) => (
          <div key={pr.url} className="py-3 flex flex-col gap-1.5">
            {/* Row: index + title */}
            <div className="flex items-start gap-2">
              <span className="mt-0.5 shrink-0 text-xs text-gray-400 dark:text-gray-600 tabular-nums w-5">
                {index + 1}
              </span>
              <a
                href={pr.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-gray-800 hover:text-violet-600 dark:text-gray-200 dark:hover:text-violet-400 transition-colors leading-snug"
                title={pr.title}
              >
                {pr.title}
              </a>
            </div>
            {/* Row: repo + status + date */}
            <div className="flex items-center gap-2 flex-wrap pl-7">
              <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-mono dark:bg-gray-800 dark:text-gray-400">
                {pr.repo.split('/')[1] ?? pr.repo}
              </span>
              <PRStatusBadge merged={pr.merged} state={pr.state} />
              <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                {new Date(pr.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop table (hidden below sm) ── */}
      <div className="hidden sm:block overflow-x-auto" data-testid="pr-table-desktop">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-500">
              <th className="pb-3 pr-4 w-10">#</th>
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4">Repository</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {prDetails.map((pr, index) => (
              <tr key={pr.number} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40">
                <td className="py-3 pr-4 text-gray-400 dark:text-gray-600 tabular-nums">{index + 1}</td>
                <td className="py-3 pr-4 max-w-xs">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-800 hover:text-violet-600 dark:text-gray-200 dark:hover:text-violet-400 transition-colors line-clamp-1"
                    title={pr.title}
                  >
                    {pr.title}
                  </a>
                </td>
                <td className="py-3 pr-4">
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 font-mono dark:bg-gray-800 dark:text-gray-400">
                    {pr.repo.split('/')[1] ?? pr.repo}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <PRStatusBadge merged={pr.merged} state={pr.state} />
                </td>
                <td className="py-3 text-gray-500 dark:text-gray-400 tabular-nums whitespace-nowrap">
                  {new Date(pr.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
