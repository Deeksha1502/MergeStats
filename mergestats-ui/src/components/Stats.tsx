import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define interfaces for your data structures
interface LocationState {
  username: string;
  year: number | string;
  month: number | string;
}

interface PrDetail {
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

interface RepoStats {
  total: number;
  merged: number;
}

interface Stats {
  totalPRs: number;
  mergedPRs: number;
  closedPRs: number;
  openPRs: number;
  repos: {
    [key: string]: RepoStats;
  };
}

interface StatsResponse {
  username: string;
  period: string;
  stats: Stats;
  prDetails: PrDetail[];
}

function Stats() {
  const location = useLocation();
  // Add correct typing to the state
  const state = location.state as LocationState | undefined;
  const username = state?.username;
  const year = state?.year;
  const month = state?.month;
  
  // Add types to your state variables
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!username || !year || !month) {
      setError("Missing required parameters");
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        const response = await axios.post<StatsResponse>('http://localhost:3000/api/stats', {
          username,
          year,
          month
        });
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username, year, month]);
  
  if (loading) return <div className="text-center mt-10">Loading statistics...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;
  if (!stats) return <div className="text-center mt-10">No data available</div>;

  // Prepare chart data
  const statusData = {
    labels: ['Merged', 'Closed (Not Merged)', 'Open'],
    datasets: [
      {
        data: [stats.stats.mergedPRs, stats.stats.closedPRs, stats.stats.openPRs],
        backgroundColor: ['#4ade80', '#ef4444', '#3b82f6']
      }
    ]
  };

  // Get top 5 repos for bar chart
  const topRepos = Object.entries(stats.stats.repos)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const reposData = {
    labels: topRepos.map(([repo]) => repo.split('/')[1] || repo), // Show only repo name, not owner
    datasets: [
      {
        label: 'Total PRs',
        data: topRepos.map(([_, data]) => data.total),
        backgroundColor: '#60a5fa'
      },
      {
        label: 'Merged PRs',
        data: topRepos.map(([_, data]) => data.merged),
        backgroundColor: '#4ade80'
      }
    ]
  };
  
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6">
        PR Statistics for @{stats.username} ({stats.period})
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="mb-2">📊 Total PRs created: <span className="font-bold">{stats.stats.totalPRs}</span></p>
            <p className="mb-2">✅ Merged: <span className="font-bold">{stats.stats.mergedPRs}</span></p>
            <p className="mb-2">❌ Closed without merging: <span className="font-bold">{stats.stats.closedPRs}</span></p>
            <p className="mb-2">⏳ Still open: <span className="font-bold">{stats.stats.openPRs}</span></p>
            <p className="mb-2">🚀 Success rate: <span className="font-bold">
              {stats.stats.totalPRs > 0 ? Math.round((stats.stats.mergedPRs / stats.stats.totalPRs) * 100) : 0}%
            </span></p>
          </div>
          <div className="h-64">
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      
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
                  title: {
                    display: true,
                    text: 'Number of PRs'
                  }
                }
              }
            }}
          />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">PR Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Repository</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {stats.prDetails.map((pr, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2">
                    <a href={pr.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      {pr.title}
                    </a>
                  </td>
                  <td className="px-4 py-2">{pr.repo}</td>
                  <td className="px-4 py-2">
                    {pr.merged ? (
                      <span className="text-green-600">Merged</span>
                    ) : pr.state === 'closed' ? (
                      <span className="text-red-600">Closed</span>
                    ) : (
                      <span className="text-blue-600">Open</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{new Date(pr.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stats;