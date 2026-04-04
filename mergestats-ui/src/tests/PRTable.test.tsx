import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

// Helper: scope queries to the desktop table to avoid conflicts with the
// mobile card layout, which is also present in the DOM (toggled via CSS only).
const getDesktop = () => within(screen.getByTestId('pr-table-desktop'));

describe('PRTable', () => {
  describe('table headers', () => {
    it('renders all column headers', () => {
      render(<PRTable prDetails={[]} />);
      const table = getDesktop();
      expect(table.getByText('#')).toBeInTheDocument();
      expect(table.getByText('Title')).toBeInTheDocument();
      expect(table.getByText('Repository')).toBeInTheDocument();
      expect(table.getByText('Status')).toBeInTheDocument();
      expect(table.getByText('Created')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('renders table with no rows when prDetails is empty', () => {
      render(<PRTable prDetails={[]} />);
      const rows = getDesktop().queryAllByRole('row');
      // Only the header row
      expect(rows).toHaveLength(1);
    });
  });

  describe('PR row rendering', () => {
    it('renders PR title as a link', () => {
      render(<PRTable prDetails={[basePR]} />);
      const link = getDesktop().getByRole('link', { name: 'Fix login bug' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', basePR.url);
    });

    it('opens PR link in a new tab', () => {
      render(<PRTable prDetails={[basePR]} />);
      const link = getDesktop().getByRole('link', { name: 'Fix login bug' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });

    it('renders the short repository name without org prefix', () => {
      render(<PRTable prDetails={[basePR]} />);
      expect(getDesktop().getByText('my-repo')).toBeInTheDocument();
    });

    it('renders the created date in short locale format', () => {
      render(<PRTable prDetails={[basePR]} />);
      const expected = new Date('2024-03-15T10:00:00Z').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      expect(getDesktop().getByText(expected)).toBeInTheDocument();
    });

    it('shows serial number starting at 1', () => {
      render(<PRTable prDetails={[basePR]} />);
      expect(getDesktop().getByText('1')).toBeInTheDocument();
    });

    it('shows Merged status for merged PRs', () => {
      render(<PRTable prDetails={[basePR]} />);
      expect(getDesktop().getByText('Merged')).toBeInTheDocument();
    });

    it('shows Closed status for closed non-merged PRs', () => {
      const closedPR: PRDetail = { ...basePR, number: 43, merged: false };
      render(<PRTable prDetails={[closedPR]} />);
      expect(getDesktop().getByText('Closed')).toBeInTheDocument();
    });

    it('shows Open status for open PRs', () => {
      const openPR: PRDetail = { ...basePR, number: 44, merged: false, state: 'open' };
      render(<PRTable prDetails={[openPR]} />);
      expect(getDesktop().getByText('Open')).toBeInTheDocument();
    });
  });

  describe('multiple PRs', () => {
    it('renders a row for each PR', () => {
      const prs: PRDetail[] = [
        basePR,
        { ...basePR, number: 43, title: 'Add feature', url: 'https://github.com/org/my-repo/pull/43' },
        { ...basePR, number: 44, title: 'Update docs', url: 'https://github.com/org/my-repo/pull/44' },
      ];
      render(<PRTable prDetails={prs} />);
      const table = getDesktop();
      expect(table.getByText('Fix login bug')).toBeInTheDocument();
      expect(table.getByText('Add feature')).toBeInTheDocument();
      expect(table.getByText('Update docs')).toBeInTheDocument();
    });

    it('renders correct number of rows including header', () => {
      const prs: PRDetail[] = [
        basePR,
        { ...basePR, number: 43, url: 'https://github.com/org/my-repo/pull/43' },
      ];
      render(<PRTable prDetails={prs} />);
      expect(getDesktop().getAllByRole('row')).toHaveLength(3); // 1 header + 2 data
    });

    it('renders sequential serial numbers', () => {
      const prs: PRDetail[] = [
        basePR,
        { ...basePR, number: 43, title: 'Add feature', url: 'https://github.com/org/my-repo/pull/43' },
        { ...basePR, number: 44, title: 'Update docs', url: 'https://github.com/org/my-repo/pull/44' },
      ];
      render(<PRTable prDetails={prs} />);
      const table = getDesktop();
      expect(table.getByText('1')).toBeInTheDocument();
      expect(table.getByText('2')).toBeInTheDocument();
      expect(table.getByText('3')).toBeInTheDocument();
    });
  });
});
