import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSummary } from '../components/StatsSummary';
import type { PRStats } from '../types/stats';

vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="pie-chart" />,
}));

vi.mock('chart.js', () => ({
  Chart: { register: vi.fn() },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock('../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

const baseStats: PRStats = {
  totalPRs: 10,
  mergedPRs: 7,
  closedPRs: 2,
  openPRs: 1,
  repos: {},
};

describe('StatsSummary', () => {
  describe('counts display', () => {
    it('renders total PR count', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('renders merged PR count', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('renders closed PR count', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders open PR count', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('success rate', () => {
    it('calculates success rate correctly (7/10 = 70%)', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('shows 0% when there are no PRs', () => {
      const empty: PRStats = { totalPRs: 0, mergedPRs: 0, closedPRs: 0, openPRs: 0, repos: {} };
      render(<StatsSummary stats={empty} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('rounds the success rate down', () => {
      const stats: PRStats = { ...baseStats, totalPRs: 3, mergedPRs: 1 };
      render(<StatsSummary stats={stats} />);
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('shows 100% when all PRs are merged', () => {
      const stats: PRStats = { ...baseStats, totalPRs: 5, mergedPRs: 5, closedPRs: 0, openPRs: 0 };
      render(<StatsSummary stats={stats} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('labels', () => {
    it('renders the Summary heading', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });

    it('renders all stat labels', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByText('Total PRs')).toBeInTheDocument();
      expect(screen.getByText('Merged')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  describe('pie chart', () => {
    it('renders the pie chart', () => {
      render(<StatsSummary stats={baseStats} />);
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });
});
