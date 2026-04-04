import { useLocation } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useStats } from '../hooks/useStats';
import { StatsSummary } from './StatsSummary';
import { PRTable } from './PRTable';
import type { LocationState } from '../types/stats';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats() {
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const { theme } = useTheme();

  const { data, loading, error } = useStats(state?.username, state?.year, state?.month);

  if (loading) return (
    <div className="flex flex-col items-center justify-center mt-20 gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-3 rounded-full border-4 border-t-transparent border-r-blue-400 border-b-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 animate-pulse">Fetching PR Statistics</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Crunching your GitHub data...</p>
      </div>
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center mt-20 gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 ring-1 ring-red-300 dark:bg-red-500/10 dark:ring-red-500/30">
        <svg className="h-8 w-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <p className="text-lg font-semibold text-red-600 dark:text-red-400">{error}</p>
    </div>
  );

  if (!data) return <div className="text-center mt-10 text-gray-400 dark:text-gray-500">No data available</div>;

  const topRepos = Object.entries(data.stats.repos)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const gridColor = theme === 'dark' ? 'rgba(75,85,99,0.2)' : 'rgba(209,213,219,0.8)';
  const tickColor = theme === 'dark' ? '#6b7280' : '#9ca3af';
  const legendColor = theme === 'dark' ? '#9ca3af' : '#6b7280';

  const reposData = {
    labels: topRepos.map(([repo]) => repo.split('/')[1] || repo),
    datasets: [
      {
        label: 'Total PRs',
        data: topRepos.map(([, d]) => d.total),
        backgroundColor: 'rgba(96, 165, 250, 0.7)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Merged PRs',
        data: topRepos.map(([, d]) => d.merged),
        backgroundColor: 'rgba(167, 139, 250, 0.7)',
        borderColor: '#8b5cf6',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-3 sm:px-4 pb-16">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/25">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            <span className="text-violet-600 dark:text-violet-400">@{data.username}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-500">PR activity for {data.period}</p>
        </div>
      </div>

      <StatsSummary stats={data.stats} />

      {/* Bar chart */}
      <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-none backdrop-blur-sm transition-colors duration-200">
        <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-gray-100">Top Repositories</h2>
        <div className="h-56 sm:h-72">
          <Bar
            data={reposData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: legendColor, boxWidth: 12, padding: 16 },
                },
              },
              scales: {
                x: {
                  ticks: { color: tickColor },
                  grid: { color: gridColor },
                },
                y: {
                  beginAtZero: true,
                  ticks: { color: tickColor },
                  grid: { color: gridColor },
                  title: { display: true, text: 'Number of PRs', color: tickColor },
                },
              },
            }}
          />
        </div>
      </div>

      <PRTable prDetails={data.prDetails} />
    </div>
  );
}

export default Stats;
