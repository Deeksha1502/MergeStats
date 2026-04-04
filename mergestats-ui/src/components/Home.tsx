import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type FilterMode = 'monthly' | 'yearly';

function Home() {
  const { user, loading: authLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [filterMode, setFilterMode] = useState<FilterMode>('monthly');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/stats', {
      state: {
        username: username || user?.login,
        year,
        ...(filterMode === 'monthly' ? { month } : {}),
      },
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4">
      {/* Hero text */}
      <div className="mb-8 sm:mb-10 text-center">
        <h1 className="mb-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            GitHub PR Analytics
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Visualize your pull request activity in seconds.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 sm:p-8 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-black/40 backdrop-blur-sm transition-colors duration-200">
        {authLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-violet-500 dark:border-gray-700"></div>
          </div>
        ) : !user ? (
          /* Not authenticated — show Login with GitHub */
          <div className="flex flex-col items-center gap-6">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Sign in with your GitHub account to view PR statistics for any user.
            </p>
            <button
              onClick={login}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-900 py-3 font-semibold text-white shadow-lg transition hover:bg-gray-800 active:scale-[0.98] dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Login with GitHub
            </button>
          </div>
        ) : (
          /* Authenticated — show the stats form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                GitHub Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={user.login}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Leave blank to use your own username (@{user.login})
              </p>
            </div>

            {/* Filter mode toggle */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by</span>
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFilterMode('monthly')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    filterMode === 'monthly'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('yearly')}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    filterMode === 'yearly'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            {/* Year + (Month — only in monthly mode) */}
            <div className={`grid gap-4 ${filterMode === 'monthly' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="year" className="text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {filterMode === 'monthly' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="month" className="text-sm font-medium text-gray-700 dark:text-gray-300">Month</label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-gray-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {MONTHS.map((name, i) => (
                      <option key={i + 1} value={i + 1}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/40 active:scale-[0.98]"
            >
              Generate Statistics
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Home;
