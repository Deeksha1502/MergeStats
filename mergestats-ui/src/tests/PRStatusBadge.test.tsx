import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PRStatusBadge } from '../components/PRStatusBadge';

describe('PRStatusBadge', () => {
  it('shows "Merged" when merged is true', () => {
    render(<PRStatusBadge merged={true} state="closed" />);
    expect(screen.getByText('Merged')).toBeInTheDocument();
  });

  it('applies violet colour for merged', () => {
    render(<PRStatusBadge merged={true} state="closed" />);
    expect(screen.getByText('Merged')).toHaveClass('text-violet-700');
  });

  it('shows "Closed" when not merged and state is closed', () => {
    render(<PRStatusBadge merged={false} state="closed" />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('applies red colour for closed', () => {
    render(<PRStatusBadge merged={false} state="closed" />);
    expect(screen.getByText('Closed')).toHaveClass('text-red-700');
  });

  it('shows "Open" when state is open', () => {
    render(<PRStatusBadge merged={false} state="open" />);
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('applies green colour for open', () => {
    render(<PRStatusBadge merged={false} state="open" />);
    expect(screen.getByText('Open')).toHaveClass('text-green-700');
  });

  it('shows "Merged" not "Closed" when both merged=true and state=closed', () => {
    render(<PRStatusBadge merged={true} state="closed" />);
    expect(screen.queryByText('Closed')).not.toBeInTheDocument();
    expect(screen.getByText('Merged')).toBeInTheDocument();
  });
});
