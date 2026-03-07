import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from '../components/Home';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home', () => {
  describe('rendering', () => {
    it('renders the page heading', () => {
      renderHome();
      expect(screen.getByText('GitHub PR Statistics')).toBeInTheDocument();
    });

    it('renders username, year, and month inputs', () => {
      renderHome();
      expect(screen.getByLabelText('GitHub Username:')).toBeInTheDocument();
      expect(screen.getByLabelText('Year:')).toBeInTheDocument();
      expect(screen.getByLabelText('Month (1-12):')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      renderHome();
      expect(screen.getByRole('button', { name: /Generate Statistics/i })).toBeInTheDocument();
    });

    it('pre-fills year with current year', () => {
      renderHome();
      const yearInput = screen.getByLabelText('Year:') as HTMLInputElement;
      expect(yearInput.value).toBe(String(new Date().getFullYear()));
    });

    it('pre-fills month with current month', () => {
      renderHome();
      const monthInput = screen.getByLabelText('Month (1-12):') as HTMLInputElement;
      expect(monthInput.value).toBe(String(new Date().getMonth() + 1));
    });
  });

  describe('form interaction', () => {
    it('updates username as user types', async () => {
      renderHome();
      const input = screen.getByLabelText('GitHub Username:') as HTMLInputElement;
      await userEvent.type(input, 'octocat');
      expect(input.value).toBe('octocat');
    });

    it('updates year as user types', async () => {
      renderHome();
      const input = screen.getByLabelText('Year:') as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, '2023');
      expect(input.value).toBe('2023');
    });

    it('updates month as user types', async () => {
      renderHome();
      const input = screen.getByLabelText('Month (1-12):') as HTMLInputElement;
      await userEvent.clear(input);
      await userEvent.type(input, '6');
      expect(input.value).toBe('6');
    });
  });

  describe('form submission', () => {
    it('navigates to /stats with correct state on submit', async () => {
      renderHome();
      await userEvent.type(screen.getByLabelText('GitHub Username:'), 'octocat');

      const yearInput = screen.getByLabelText('Year:');
      await userEvent.clear(yearInput);
      await userEvent.type(yearInput, '2024');

      const monthInput = screen.getByLabelText('Month (1-12):');
      await userEvent.clear(monthInput);
      await userEvent.type(monthInput, '3');

      await userEvent.click(screen.getByRole('button', { name: /Generate Statistics/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/stats', {
        state: { username: 'octocat', year: 2024, month: 3 },
      });
    });
  });
});
