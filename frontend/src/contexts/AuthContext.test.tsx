import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api/client', () => ({
  setUnauthorizedHandler: vi.fn(),
  apiClient: {},
}));

import * as clientModule from '../api/client';

// Helper component that exposes auth state and actions
function AuthConsumer() {
  const { isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <button onClick={() => login('my-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubGlobal('location', { replace: vi.fn() });
});

describe('AuthProvider', () => {
  it('is anonymous when no token in localStorage', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
  });

  it('is authenticated when a token already exists in localStorage', () => {
    localStorage.setItem('access_token', 'existing-token');
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
  });

  it('stores token and marks user as authenticated on login', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Login'));

    expect(localStorage.getItem('access_token')).toBe('my-token');
    expect(screen.getByTestId('status')).toHaveTextContent('authenticated');
  });

  it('removes token and marks user as anonymous on logout', async () => {
    localStorage.setItem('access_token', 'existing-token');
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Logout'));

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(screen.getByTestId('status')).toHaveTextContent('anonymous');
  });

  it('redirects to /login on logout', async () => {
    localStorage.setItem('access_token', 'token');
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await user.click(screen.getByText('Logout'));

    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });

  it('registers the logout function as the unauthorized handler on mount', () => {
    localStorage.setItem('access_token', 'token');
    let capturedHandler: (() => void) | undefined;
    vi.mocked(clientModule.setUnauthorizedHandler).mockImplementation((h) => {
      capturedHandler = h;
    });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(capturedHandler).toBeDefined();

    // Calling the registered handler should perform logout
    act(() => capturedHandler!());

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(window.location.replace).toHaveBeenCalledWith('/login');
  });
});
