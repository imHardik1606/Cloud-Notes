// Mock next/navigation BEFORE importing components
jest.mock('next/navigation', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };
  return {
    useRouter: jest.fn(() => mockRouter),
    usePathname: () => '/dashboard',
    useSearchParams: () => new URLSearchParams(),
  };
});

// Mock authServices
jest.mock('@/services/authServices', () => ({
  checkAuth: jest.fn(),
}));

import { render, screen, waitFor } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import * as authServices from '@/services/authServices';
import { useRouter } from 'next/navigation';

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', async () => {
    authServices.checkAuth.mockResolvedValue({ authenticated: true });

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  test('does not render children initially while checking auth', () => {
    authServices.checkAuth.mockImplementation(() => new Promise(() => {}));

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    // Content should not be visible while loading
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  test('renders null when user is not authenticated', async () => {
    authServices.checkAuth.mockResolvedValue({ authenticated: false });

    const TestComponent = () => <div>Protected Content</div>;

    const { container } = render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  test('handles auth check errors gracefully', async () => {
    authServices.checkAuth.mockRejectedValue(new Error('Auth failed'));

    const TestComponent = () => <div>Protected Content</div>;

    const { container } = render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  test('wraps multiple children correctly', async () => {
    authServices.checkAuth.mockResolvedValue({ authenticated: true });

    render(
      <ProtectedRoute>
        <div>First Child</div>
        <div>Second Child</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });
});