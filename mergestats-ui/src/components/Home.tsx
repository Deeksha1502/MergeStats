import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function Home() {
  const [username, setUsername] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate('/stats', { state: { username, year, month } });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i);

  return (
    <div className="flex min-h-[calc(100vh-65px)] flex-col items-center justify-center px-4">
      {/* Hero text */}
      <div className="mb-10 text-center">
        <h1 className="mb-3 text-5xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
            GitHub PR Analytics
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Visualize your pull request activity in seconds.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/60 dark:border-gray-800 dark:bg-gray-900/60 dark:shadow-black/40 backdrop-blur-sm transition-colors duration-200">
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
                placeholder="e.g. torvalds"
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-gray-900 placeholder-gray-400 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                required
              />
            </div>
          </div>

          {/* Year + Month */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-500 hover:to-blue-500 hover:shadow-violet-500/40 active:scale-[0.98]"
          >
            Generate Statistics
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;
