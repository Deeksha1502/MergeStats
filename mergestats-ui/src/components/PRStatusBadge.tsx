interface Props {
  merged: boolean;
  state: string;
}

export function PRStatusBadge({ merged, state }: Props) {
  if (merged) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-violet-300 dark:bg-violet-500/15 dark:text-violet-400 dark:ring-violet-500/30">
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218ZM4.25 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm8.5-4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM5 3.25a.75.75 0 1 0 0 .005V3.25Z" />
        </svg>
        Merged
      </span>
    );
  }
  if (state === 'closed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-300 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/30">
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
        Closed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-300 dark:bg-green-500/15 dark:text-green-400 dark:ring-green-500/30">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400" />
      Open
    </span>
  );
}
