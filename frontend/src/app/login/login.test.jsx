// Mock next/navigation BEFORE importing Login component
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authServices
jest.mock('@/services/authServices', () => ({
  login: jest.fn(),
}));

import { render, screen } from "@testing-library/react"
import Login from "./page"

describe('Login Page', () => {
  test("login page renders with email and password inputs", () => {
    render(<Login />);

    // Check for email input
    const emailInput = screen.getByPlaceholderText('hello@example.com');
    expect(emailInput).toBeInTheDocument();

    // Check for password input
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toBeInTheDocument();
  });

  test("login page renders with sign in button", () => {
    render(<Login />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });

  test("login page renders with CloudNotes heading", () => {
    render(<Login />);

    const heading = screen.getByText(/Welcome to CloudNotes/i);
    expect(heading).toBeInTheDocument();
  });

  test("login page renders with signup link", () => {
    render(<Login />);

    const signupLink = screen.getByRole('link', { name: /sign up free/i });
    expect(signupLink).toBeInTheDocument();
  });
});