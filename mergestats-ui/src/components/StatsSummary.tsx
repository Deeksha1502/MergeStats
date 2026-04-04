import { Pie } from 'react-chartjs-2';
import type { PRStats } from '../types/stats';
import { useTheme } from '../context/ThemeContext';

interface Props {
  stats: PRStats;
}

const statCards = (stats: PRStats, successRate: number) => [
  {
    label: 'Total PRs',
    value: stats.totalPRs,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    ring: 'ring-blue-200 dark:ring-blue-500/20',
  },
  {
    label: 'Merged',
    value: stats.mergedPRs,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
      </svg>
    ),
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    ring: 'ring-violet-200 dark:ring-violet-500/20',
  },
  {
    label: 'Closed',
    value: stats.closedPRs,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    ring: 'ring-red-200 dark:ring-red-500/20',
  },
  {
    label: 'Open',
    value: stats.openPRs,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-500/10',
    ring: 'ring-green-200 dark:ring-green-500/20',
  },
  {
    label: 'Success Rate',
    value: `${successRate}%`,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    ring: 'ring-amber-200 dark:ring-amber-500/20',
  },
];

export function StatsSummary({ stats }: Props) {
  const { theme } = useTheme();
  const successRate = stats.totalPRs > 0 ? Math.round((stats.mergedPRs / stats.totalPRs) * 100) : 0;

  const legendColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  const statusData = {
    labels: ['Merged', 'Closed', 'Open'],
    datasets: [
      {
        data: [stats.mergedPRs, stats.closedPRs, stats.openPRs],
        backgroundColor: ['#a78bfa', '#f87171', '#4ade80'],
        borderColor: theme === 'dark' ? ['#7c3aed', '#dc2626', '#16a34a'] : ['#ddd6fe', '#fecaca', '#bbf7d0'],
        borderWidth: 1,
      },
    ],
  };

  const cards = statCards(stats, successRate);

  return (
    <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none backdrop-blur-sm transition-colors duration-200">
      <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-100">Summary</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`flex flex-col gap-2 rounded-xl ${card.bg} p-4 ring-1 ${card.ring} transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md cursor-default`}
          >
            <div className={card.color}>{card.icon}</div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="h-40 w-40 sm:h-52 sm:w-52">
          <Pie
            data={statusData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: legendColor, boxWidth: 12, padding: 16 },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
