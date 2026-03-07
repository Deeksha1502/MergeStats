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

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Stats() {
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  const { data, loading, error } = useStats(state?.username, state?.year, state?.month);

  if (loading) return <div className="text-center mt-10">Loading statistics...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!data) return <div className="text-center mt-10">No data available</div>;

  const topRepos = Object.entries(data.stats.repos)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const reposData = {
    labels: topRepos.map(([repo]) => repo.split('/')[1] || repo),
    datasets: [
      {
        label: 'Total PRs',
        data: topRepos.map(([, d]) => d.total),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Merged PRs',
        data: topRepos.map(([, d]) => d.merged),
        backgroundColor: '#4ade80',
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">
        PR Statistics for @{data.username} ({data.period})
      </h1>

      <StatsSummary stats={data.stats} />

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Repositories</h2>
        <div className="h-80">
          <Bar
            data={reposData}
            options={{
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  title: { display: true, text: 'Number of PRs' },
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
