import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { system } from '../../theme';
import DashboardLayout from './DashboardLayout';

function renderWithRoute(initialPath: string) {
  return render(
    <ChakraProvider value={system}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route element={<DashboardLayout />}>
              <Route path="/my-files" element={<div>My Files content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ChakraProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe('DashboardLayout auth guard', () => {
  it('redirects to /login when the user is not authenticated', () => {
    renderWithRoute('/my-files');
    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('My Files content')).not.toBeInTheDocument();
  });

  it('renders the protected page when the user is authenticated', () => {
    localStorage.setItem('access_token', 'valid-token');
    renderWithRoute('/my-files');
    expect(screen.getByText('My Files content')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
