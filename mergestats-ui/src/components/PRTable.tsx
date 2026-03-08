import type { PRDetail } from '../types/stats';
import { PRStatusBadge } from './PRStatusBadge';

interface Props {
  prDetails: PRDetail[];
}

export function PRTable({ prDetails }: Props) {
  return (
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
            {prDetails.map((pr, index) => (
              <tr key={pr.number} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="px-4 py-2">
                  <a
                    href={pr.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {pr.title}
                  </a>
                </td>
                <td className="px-4 py-2">{pr.repo}</td>
                <td className="px-4 py-2">
                  <PRStatusBadge merged={pr.merged} state={pr.state} />
                </td>
                <td className="px-4 py-2">
                  {new Date(pr.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
