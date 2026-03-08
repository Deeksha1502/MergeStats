import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { GitHubAuthUser } from '../types/stats';
import { useSearchParams, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

interface AuthContextValue {
  user: GitHubAuthUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GitHubAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for user info in URL (from OAuth callback redirect)
  useEffect(() => {
    const login = searchParams.get('login');
    const avatar_url = searchParams.get('avatar_url');
    const name = searchParams.get('name');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      navigate('/', { replace: true });
      setLoading(false);
      return;
    }

    if (login) {
      setUser({ login, avatar_url: avatar_url ?? '', name: name || null });
      // Clean the URL query params
      navigate('/', { replace: true });
      setLoading(false);
      return;
    }

    // No query params — check if we have a valid session cookie via /auth/me
    fetch(`${BASE_URL}/auth/me`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data: { authenticated: boolean; user?: GitHubAuthUser }) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        // Not authenticated — that's fine
      })
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(() => {
    window.location.href = `${BASE_URL}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
