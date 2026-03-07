# MergeStats — Architecture, Refactoring & Frontend-Backend Connection Guide

## What This Project Does

MergeStats is a GitHub PR analytics tool. A user enters a GitHub username, year, and month. The app fetches all pull requests that user created in that period via the GitHub API, then displays aggregated stats (total, merged, closed, open), a pie chart of PR status, a bar chart of top repositories, and a full PR detail table.

---

## Project Structure

```
MergeStats/
├── index.ts                  # app bootstrap (cors, json, listen)
├── tsconfig.json             # TypeScript config
├── types/
│   └── index.ts              # all shared interfaces
├── routes/
│   └── stats.ts              # POST /api/stats (HTTP layer only)
├── services/
│   └── github.ts             # fetchPRs, getPRDetails, generateStats
├── utils/
│   ├── githubClient.ts       # shared githubFetch + rate limit check
│   ├── dateUtils.ts          # date range builder
│   └── validate.ts           # input validation
├── tests/
│   ├── dateUtils.test.ts
│   ├── validate.test.ts
│   └── github.test.ts
└── mergestats-ui/            # React + TypeScript frontend (Vite)
    ├── src/
    │   ├── App.tsx           # Router setup
    │   ├── components/
    │   │   ├── Home.tsx      # Input form (username, year, month)
    │   │   ├── Stats.tsx     # Stats display + charts + PR table
    │   │   └── Navbar.tsx    # Top navigation bar
    │   └── main.tsx          # React entry point
    ├── vite.config.ts
    └── package.json
```

---

## How the Code Works

### Backend (`index.ts` + modules)

The Express server exposes a single `POST /api/stats` endpoint. When called:

1. **`routes/stats.ts`** — Validates the request body is a non-null object, then calls `validateStatsInput`. Returns 400 on bad input.
2. **`services/github.ts` → `fetchPRs()`** — Queries the GitHub Search API (`/search/issues?type:pr+author:...`) with pagination (up to 10 pages × 100 results). Uses `URLSearchParams` to safely encode the query.
3. **`services/github.ts` → `getPRDetails()`** — For each PR found, fetches the full PR object from `/repos/{owner}/{repo}/pulls/{number}` to get the `merged` boolean and dates.
4. **`services/github.ts` → `generateStats()`** — Computes aggregate counts (total, merged, closed, open) and a per-repo breakdown.
5. Returns a JSON payload: `{ username, period, stats, prDetails }`.

### Shared Utilities

- **`utils/githubClient.ts`** — `githubFetch<T>()` builds auth headers at call time (not import time), checks rate limits, validates `Content-Type`, checks `response.ok` before parsing JSON, and throws clear errors for all failure cases.
- **`utils/dateUtils.ts`** — `buildDateRange()` returns `{ startDate, endDate, monthStr }`. `getLastDayOfMonth()` handles leap years correctly.
- **`utils/validate.ts`** — `validateStatsInput()` uses `INTEGER_RE` to reject partial strings like `"6abc"`, and `GITHUB_USERNAME_RE` to enforce GitHub's actual username rules.

### Frontend (`mergestats-ui/`)

- **`Home.tsx`** — A form that collects username, year, and month, then navigates to `/stats` passing the values via React Router location state.
- **`Stats.tsx`** — On mount, reads location state, calls `POST http://localhost:3000/api/stats` via `axios`, and renders:
  - Summary counts
  - Pie chart (merged / closed / open)
  - Bar chart (top 5 repos by PR count)
  - PR detail table with links
- **`Navbar.tsx`** — Simple nav with a Home link.

---

## Frontend Refactoring (TODO)

### Recommended structure

```
mergestats-ui/src/
├── types/
│   └── stats.ts          # All shared TypeScript interfaces
├── api/
│   └── statsApi.ts       # Axios call, typed request/response
├── hooks/
│   └── useStats.ts       # Custom hook: fetching + loading/error state
├── components/
│   ├── Home.tsx
│   ├── Stats.tsx          # Thin — just composes sub-components
│   ├── Navbar.tsx
│   ├── StatsSummary.tsx   # Summary counts section
│   ├── PRStatusBadge.tsx  # Merged / Closed / Open badge
│   └── PRTable.tsx        # PR detail table
└── App.tsx
```

### Key changes needed

1. **Centralize types** — Move all interfaces from `Stats.tsx` into `src/types/stats.ts`
2. **Isolate the API call** — Create `src/api/statsApi.ts` using `VITE_API_URL` env var instead of hardcoded `http://localhost:3000`
3. **Custom hook** — Extract data fetching out of `Stats.tsx` into `src/hooks/useStats.ts`
4. **Extract `PRStatusBadge`** — Reusable badge instead of inline ternaries in the table
5. **Fix `e: any`** — In `Home.tsx`, replace with `React.FormEvent<HTMLFormElement>`

---

## Connecting Frontend and Backend

### Current Setup (Development)

The frontend calls the backend directly at `http://localhost:3000`. Both must be running simultaneously:

```bash
# Terminal 1 — Backend
npm run dev        # runs on http://localhost:3000

# Terminal 2 — Frontend
cd mergestats-ui
npm run dev        # runs on http://localhost:5173
```

---

### Recommended: Use a Vite Proxy (Development)

Instead of hardcoding `http://localhost:3000`, configure a Vite proxy so the frontend can call `/api/stats` without CORS.

**`vite.config.ts`:**
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

**`src/api/statsApi.ts`:**
```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const { data } = await axios.post<StatsResponse>(`${BASE_URL}/api/stats`, { username, year, month });
```

---

### Environment Variable for API URL

**`mergestats-ui/.env`:**
```
VITE_API_URL=http://localhost:3000
```

**`mergestats-ui/.env.production`:**
```
VITE_API_URL=https://your-production-api.com
```

---

### Production Deployment Options

| Option | How |
|--------|-----|
| Same server | Serve the built frontend as static files from Express: `app.use(express.static('mergestats-ui/dist'))` |
| Separate hosts | Deploy frontend to Vercel/Netlify, backend to a server. Set `VITE_API_URL` in the frontend env. |

**To serve static files from Express (same-server option):**
```ts
import path from 'path';
app.use(express.static(path.join(__dirname, 'mergestats-ui/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'mergestats-ui/dist/index.html'));
});
```

---

## npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend with ts-node (no build needed) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Build then run `dist/index.js` |
| `npm test` | Run all 46 unit tests |
