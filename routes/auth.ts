import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { GitHubUser, OAuthTokenResponse } from '../types';

const router = Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? 'http://localhost:3000/auth/github/callback';
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Stores state tokens for CSRF protection (in-memory; swap to Redis for production scale)
const pendingStates = new Set<string>();

// GET /auth/github — Initiate OAuth flow
router.get('/github', (_req: Request, res: Response) => {
  if (!GITHUB_CLIENT_ID) {
    res.status(500).json({ error: 'GitHub OAuth is not configured.' });
    return;
  }

  const state = crypto.randomBytes(20).toString('hex');
  pendingStates.add(state);

  // Clean up stale states after 10 minutes
  setTimeout(() => pendingStates.delete(state), 10 * 60 * 1000);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'read:user',
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// GET /auth/github/callback — Exchange code for access token
router.get('/github/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query as { code?: string; state?: string };

    if (!code || !state) {
      res.redirect(`${CLIENT_URL}/?error=missing_code`);
      return;
    }

    if (!pendingStates.has(state)) {
      res.redirect(`${CLIENT_URL}/?error=invalid_state`);
      return;
    }
    pendingStates.delete(state);

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = (await tokenResponse.json()) as OAuthTokenResponse & { error?: string };

    if (tokenData.error || !tokenData.access_token) {
      console.error('OAuth token exchange failed:', tokenData);
      res.redirect(`${CLIENT_URL}/?error=token_exchange_failed`);
      return;
    }

    // Fetch the authenticated user's profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        'User-Agent': 'mergestats-script',
      },
    });
    const user = (await userResponse.json()) as GitHubUser;

    // Set secure HTTP-only cookie with the access token
    res.cookie('github_token', tokenData.access_token, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: IS_PRODUCTION ? 'none' : 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/',
    });

    // Redirect to the frontend with user info as query params (non-sensitive)
    const params = new URLSearchParams({
      login: user.login,
      avatar_url: user.avatar_url ?? '',
      name: user.name ?? '',
    });

    res.redirect(`${CLIENT_URL}/?${params.toString()}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${CLIENT_URL}/?error=server_error`);
  }
});

// GET /auth/me — Check if user is authenticated
router.get('/me', async (req: Request, res: Response) => {
  const token = (req as Request & { cookies?: Record<string, string> }).cookies?.github_token;
  if (!token) {
    res.status(401).json({ authenticated: false });
    return;
  }

  try {
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'mergestats-script',
      },
    });

    if (!userResponse.ok) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const user = (await userResponse.json()) as GitHubUser;
    res.json({
      authenticated: true,
      user: {
        login: user.login,
        avatar_url: user.avatar_url,
        name: user.name,
      },
    });
  } catch {
    res.status(401).json({ authenticated: false });
  }
});

// POST /auth/logout — Clear the auth cookie
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('github_token', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    path: '/',
  });
  res.json({ success: true });
});

export default router;
