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

const mockLogin = vi.fn();
const mockLogout = vi.fn();

// Default: authenticated user
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { login: 'testuser', avatar_url: 'https://example.com/avatar.png', name: 'Test User' },
    loading: false,
    login: mockLogin,
    logout: mockLogout,
  }),
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home', () => {
  describe('rendering (authenticated)', () => {
    it('renders the page heading', () => {
      renderHome();
      expect(screen.getByText('GitHub PR Analytics')).toBeInTheDocument();
    });

    it('renders username input and year/month selects', () => {
      renderHome();
      expect(screen.getByLabelText('GitHub Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Year')).toBeInTheDocument();
      expect(screen.getByLabelText('Month')).toBeInTheDocument();
    });

    it('renders the submit button', () => {
      renderHome();
      expect(screen.getByRole('button', { name: /Generate Statistics/i })).toBeInTheDocument();
    });

    it('pre-fills year with current year', () => {
      renderHome();
      const yearSelect = screen.getByLabelText('Year') as HTMLSelectElement;
      expect(yearSelect.value).toBe(String(new Date().getFullYear()));
    });

    it('pre-fills month with current month', () => {
      renderHome();
      const monthSelect = screen.getByLabelText('Month') as HTMLSelectElement;
      expect(monthSelect.value).toBe(String(new Date().getMonth() + 1));
    });
  });

  describe('form interaction', () => {
    it('updates username as user types', async () => {
      renderHome();
      const input = screen.getByLabelText('GitHub Username') as HTMLInputElement;
      await userEvent.type(input, 'octocat');
      expect(input.value).toBe('octocat');
    });

    it('updates year when an option is selected', async () => {
      renderHome();
      const select = screen.getByLabelText('Year') as HTMLSelectElement;
      await userEvent.selectOptions(select, '2023');
      expect(select.value).toBe('2023');
    });

    it('updates month when an option is selected', async () => {
      renderHome();
      const select = screen.getByLabelText('Month') as HTMLSelectElement;
      await userEvent.selectOptions(select, '6');
      expect(select.value).toBe('6');
    });
  });

  describe('form submission', () => {
    it('navigates to /stats with correct state on submit', async () => {
      renderHome();
      await userEvent.type(screen.getByLabelText('GitHub Username'), 'octocat');
      await userEvent.selectOptions(screen.getByLabelText('Year'), '2024');
      await userEvent.selectOptions(screen.getByLabelText('Month'), '3');

      await userEvent.click(screen.getByRole('button', { name: /Generate Statistics/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/stats', {
        state: { username: 'octocat', year: 2024, month: 3 },
      });
    });

    it('falls back to logged-in username when input is empty', async () => {
      renderHome();
      await userEvent.selectOptions(screen.getByLabelText('Year'), '2024');
      await userEvent.selectOptions(screen.getByLabelText('Month'), '3');

      await userEvent.click(screen.getByRole('button', { name: /Generate Statistics/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/stats', {
        state: { username: 'testuser', year: 2024, month: 3 },
      });
    });
  });
});
