import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRTable } from '../components/PRTable';
import type { PRDetail } from '../types/stats';

const basePR: PRDetail = {
  title: 'Fix login bug',
  number: 42,
  repo: 'org/my-repo',
  merged: true,
  state: 'closed',
  created_at: '2024-03-15T10:00:00Z',
  merged_at: '2024-03-16T10:00:00Z',
  closed_at: '2024-03-16T10:00:00Z',
  url: 'https://github.com/org/my-repo/pull/42',
};

describe('PRTable', () => {
  describe('table headers', () => {
    it('renders all column headers', () => {
      render(<PRTable prDetails={[]} />);
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Repository')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders table with no rows when prDetails is empty', () => {
      render(<PRTable prDetails={[]} />);
      const rows = screen.queryAllByRole('row');
      // Only the header row
      expect(rows).toHaveLength(1);
    });
  });

  describe('PR row rendering', () => {
    it('renders PR title as a link', () => {
      render(<PRTable prDetails={[basePR]} />);
      const link = screen.getByRole('link', { name: 'Fix login bug' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', basePR.url);
    });

    it('opens PR link in a new tab', () => {
      render(<PRTable prDetails={[basePR]} />);
      const link = screen.getByRole('link', { name: 'Fix login bug' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });

    it('renders the repository name', () => {
      render(<PRTable prDetails={[basePR]} />);
      expect(screen.getByText('org/my-repo')).toBeInTheDocument();
    });

    it('renders the created date formatted as a locale date string', () => {
      render(<PRTable prDetails={[basePR]} />);
      const expected = new Date('2024-03-15T10:00:00Z').toLocaleDateString();
      expect(screen.getByText(expected)).toBeInTheDocument();
    });

    it('shows Merged status for merged PRs', () => {
      render(<PRTable prDetails={[basePR]} />);
      expect(screen.getByText('Merged')).toBeInTheDocument();
    });

    it('shows Closed status for closed non-merged PRs', () => {
      const closedPR: PRDetail = { ...basePR, number: 43, merged: false };
      render(<PRTable prDetails={[closedPR]} />);
      expect(screen.getByText('Closed')).toBeInTheDocument();
    });

    it('shows Open status for open PRs', () => {
      const openPR: PRDetail = { ...basePR, number: 44, merged: false, state: 'open' };
      render(<PRTable prDetails={[openPR]} />);
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('multiple PRs', () => {
    it('renders a row for each PR', () => {
      const prs: PRDetail[] = [
        basePR,
        { ...basePR, number: 43, title: 'Add feature' },
        { ...basePR, number: 44, title: 'Update docs' },
      ];
      render(<PRTable prDetails={prs} />);
      expect(screen.getByText('Fix login bug')).toBeInTheDocument();
      expect(screen.getByText('Add feature')).toBeInTheDocument();
      expect(screen.getByText('Update docs')).toBeInTheDocument();
    });

    it('renders correct number of rows including header', () => {
      const prs: PRDetail[] = [basePR, { ...basePR, number: 43 }];
      render(<PRTable prDetails={prs} />);
      expect(screen.getAllByRole('row')).toHaveLength(3); // 1 header + 2 data
    });
  });
});
