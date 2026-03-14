// Mock next/navigation BEFORE importing Signup component
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/signup',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock authServices
jest.mock('@/services/authServices', () => ({
  signup: jest.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Signup from "./page"

describe('Signup Page', () => {
  test("signup page renders with all form fields", () => {
    render(<Signup />);

    // Check for username input
    const usernameInput = screen.getByPlaceholderText('johndoe');
    expect(usernameInput).toBeInTheDocument();

    // Check for email input
    const emailInput = screen.getByPlaceholderText('hello@example.com');
    expect(emailInput).toBeInTheDocument();

    // Check for password inputs
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs).toHaveLength(2); // password and confirm password
  });

  test("signup page renders with sign up button", () => {
    render(<Signup />);

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    expect(signUpButton).toBeInTheDocument();
  });

  test("signup page renders with heading", () => {
    render(<Signup />);

    const heading = screen.getByText(/Create an account/i);
    expect(heading).toBeInTheDocument();
  });

  test("signup page renders with login link", () => {
    render(<Signup />);

    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toBeInTheDocument();
  });

  test("username input accepts user input", () => {
    render(<Signup />);

    const usernameInput = screen.getByPlaceholderText('johndoe');
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    
    expect(usernameInput.value).toBe('testuser');
  });

  test("email input accepts user input", () => {
    render(<Signup />);

    const emailInput = screen.getByPlaceholderText('hello@example.com');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test("password input accepts user input", () => {
    render(<Signup />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0]; // First password field
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  test("confirm password input accepts user input", () => {
    render(<Signup />);

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const confirmPasswordInput = passwordInputs[1]; // Second password field
    
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test("form fields can be filled with valid data", () => {
    render(<Signup />);

    const usernameInput = screen.getByPlaceholderText('johndoe');
    const emailInput = screen.getByPlaceholderText('hello@example.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(confirmPasswordInput.value).toBe('password123');
  });

  test("sign up button is enabled when not loading", () => {
    render(<Signup />);

    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    expect(signUpButton).not.toBeDisabled();
  });

  test("inputs are disabled when loading", async () => {
    const { signup } = require('@/services/authServices');
    signup.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

    render(<Signup />);

    const usernameInput = screen.getByPlaceholderText('johndoe');
    const emailInput = screen.getByPlaceholderText('hello@example.com');
    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    const signUpButton = screen.getByRole('button', { name: /sign up/i });

    // Fill form
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    // Submit form
    fireEvent.click(signUpButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });
});