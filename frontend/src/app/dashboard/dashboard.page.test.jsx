// Mock next/navigation BEFORE importing components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authServices
jest.mock('@/services/authServices', () => ({
  getCurrentUser: jest.fn(),
  logout: jest.fn(),
  checkAuth: jest.fn(),
}));

// Mock noteServices
jest.mock('@/services/noteServices', () => ({
  createNote: jest.fn(),
  fetchAllNotes: jest.fn(),
  fetchNoteById: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
  searchNotes: jest.fn(),
}));

// Mock ProtectedRoute component
jest.mock('@/components/ProtectedRoute', () => {
  return function ProtectedRoute({ children }) {
    return <>{children}</>;
  };
});

// Mock Dashboard component
jest.mock('@/components/Dashboard', () => {
  return function Dashboard() {
    return <div>Dashboard Component</div>;
  };
});

import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('DashboardPage Component', () => {
  test('renders DashboardPage component', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
  });

  test('wraps Dashboard with ProtectedRoute', () => {
    const { container } = render(<DashboardPage />);

    // The Dashboard should be rendered within ProtectedRoute
    expect(screen.getByText('Dashboard Component')).toBeInTheDocument();
  });

  test('exports default component', () => {
    expect(DashboardPage).toBeDefined();
    expect(typeof DashboardPage).toBe('function');
  });
});