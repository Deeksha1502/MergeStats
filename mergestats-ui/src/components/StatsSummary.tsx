import { Pie } from 'react-chartjs-2';
import type { PRStats } from '../types/stats';

interface Props {
  stats: PRStats;
}

export function StatsSummary({ stats }: Props) {
  const successRate =
    stats.totalPRs > 0 ? Math.round((stats.mergedPRs / stats.totalPRs) * 100) : 0;

  const statusData = {
    labels: ['Merged', 'Closed (Not Merged)', 'Open'],
    datasets: [
      {
        data: [stats.mergedPRs, stats.closedPRs, stats.openPRs],
        backgroundColor: ['#4ade80', '#ef4444', '#3b82f6'],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="mb-2">
            Total PRs created: <span className="font-bold">{stats.totalPRs}</span>
          </p>
          <p className="mb-2">
            Merged: <span className="font-bold">{stats.mergedPRs}</span>
          </p>
          <p className="mb-2">
            Closed without merging: <span className="font-bold">{stats.closedPRs}</span>
          </p>
          <p className="mb-2">
            Still open: <span className="font-bold">{stats.openPRs}</span>
          </p>
          <p className="mb-2">
            Success rate: <span className="font-bold">{successRate}%</span>
          </p>
        </div>
        <div className="h-64">
          <Pie data={statusData} options={{ maintainAspectRatio: false }} />
        </div>
      </div>
    </div>
  );
}
