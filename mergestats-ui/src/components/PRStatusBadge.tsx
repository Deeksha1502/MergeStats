interface Props {
  merged: boolean;
  state: string;
}

export function PRStatusBadge({ merged, state }: Props) {
  if (merged) return <span className="text-green-600">Merged</span>;
  if (state === 'closed') return <span className="text-red-600">Closed</span>;
  return <span className="text-blue-600">Open</span>;
}
