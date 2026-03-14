import * as authServices from './authServices';
import api from '@/lib/axios';

// Mock the axios instance
jest.mock('@/lib/axios');

describe('Auth Services', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  // ==================== LOGIN TESTS ====================
  describe('login', () => {
    const mockEmail = 'user@example.com';
    const mockPassword = 'password123';
    const mockResponseData = {
      token: 'jwt-token-123',
      user: {
        id: 1,
        email: mockEmail,
        username: 'testuser'
      }
    };

    test('should successfully log in with valid credentials', async () => {
      api.post.mockResolvedValue({ data: mockResponseData });

      const result = await authServices.login(mockEmail, mockPassword);

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: mockEmail,
        password: mockPassword
      });
      expect(result).toEqual(mockResponseData);
      expect(result.token).toBe('jwt-token-123');
    });

    test('should call api.post with correct endpoint and data', async () => {
      api.post.mockResolvedValue({ data: mockResponseData });

      await authServices.login(mockEmail, mockPassword);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: mockEmail,
        password: mockPassword
      });
    });

    test('should throw error on invalid credentials', async () => {
      const mockError = new Error('Invalid credentials');
      api.post.mockRejectedValue(mockError);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.post.mockRejectedValue(networkError);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toThrow(
        'Network Error'
      );
      expect(console.error).toHaveBeenCalledWith('Login error:', networkError);
    });

    test('should throw error on 401 unauthorized', async () => {
      const unauthorizedError = new Error('Unauthorized');
      unauthorizedError.response = { status: 401 };
      api.post.mockRejectedValue(unauthorizedError);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    test('should throw error on 500 server error', async () => {
      const serverError = new Error('Server Error');
      serverError.response = { status: 500 };
      api.post.mockRejectedValue(serverError);

      await expect(authServices.login(mockEmail, mockPassword)).rejects.toThrow();
    });
  });

  // ==================== SIGNUP TESTS ====================
  describe('signup', () => {
    const mockUsername = 'testuser';
    const mockEmail = 'newuser@example.com';
    const mockPassword = 'securepass123';
    const mockResponseData = {
      token: 'jwt-token-456',
      user: {
        id: 2,
        username: mockUsername,
        email: mockEmail
      }
    };

    test('should successfully sign up with valid credentials', async () => {
      api.post.mockResolvedValue({ data: mockResponseData });

      const result = await authServices.signup(mockUsername, mockEmail, mockPassword);

      expect(api.post).toHaveBeenCalledWith('/auth/signup', {
        username: mockUsername,
        email: mockEmail,
        password: mockPassword
      });
      expect(result).toEqual(mockResponseData);
      expect(result.user.username).toBe(mockUsername);
    });

    test('should call api.post with correct endpoint and data', async () => {
      api.post.mockResolvedValue({ data: mockResponseData });

      await authServices.signup(mockUsername, mockEmail, mockPassword);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/auth/signup', {
        username: mockUsername,
        email: mockEmail,
        password: mockPassword
      });
    });

    test('should throw error when email already exists', async () => {
      const conflictError = new Error('Email already exists');
      conflictError.response = { status: 409 };
      api.post.mockRejectedValue(conflictError);

      await expect(
        authServices.signup(mockUsername, mockEmail, mockPassword)
      ).rejects.toThrow('Email already exists');
    });

    test('should throw error when username already exists', async () => {
      const conflictError = new Error('Username already taken');
      conflictError.response = { status: 409 };
      api.post.mockRejectedValue(conflictError);

      await expect(
        authServices.signup(mockUsername, mockEmail, mockPassword)
      ).rejects.toThrow('Username already taken');
    });

    test('should throw error on validation failure', async () => {
      const validationError = new Error('Validation failed');
      validationError.response = { status: 400 };
      api.post.mockRejectedValue(validationError);

      await expect(
        authServices.signup(mockUsername, mockEmail, mockPassword)
      ).rejects.toThrow('Validation failed');
      expect(console.error).toHaveBeenCalledWith('Signup error:', validationError);
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.post.mockRejectedValue(networkError);

      await expect(
        authServices.signup(mockUsername, mockEmail, mockPassword)
      ).rejects.toThrow('Network Error');
    });
  });

  // ==================== LOGOUT TESTS ====================
  describe('logout', () => {
    test('should successfully log out', async () => {
      api.post.mockResolvedValue({});

      await authServices.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
      expect(api.post).toHaveBeenCalledTimes(1);
    });

    test('should not return data on logout', async () => {
      api.post.mockResolvedValue({ data: null });

      const result = await authServices.logout();

      expect(result).toBeUndefined();
    });

    test('should throw error on logout failure', async () => {
      const logoutError = new Error('Logout failed');
      api.post.mockRejectedValue(logoutError);

      await expect(authServices.logout()).rejects.toThrow('Logout failed');
      expect(console.error).toHaveBeenCalledWith('Logout error:', logoutError);
    });

    test('should throw error when user is not authenticated', async () => {
      const authError = new Error('Not authenticated');
      authError.response = { status: 401 };
      api.post.mockRejectedValue(authError);

      await expect(authServices.logout()).rejects.toThrow('Not authenticated');
    });

    test('should handle network errors during logout', async () => {
      const networkError = new Error('Network Error');
      api.post.mockRejectedValue(networkError);

      await expect(authServices.logout()).rejects.toThrow('Network Error');
    });
  });

  // ==================== GET CURRENT USER TESTS ====================
  describe('getCurrentUser', () => {
    const mockUserData = {
      id: 1,
      username: 'testuser',
      email: 'user@example.com',
      createdAt: '2024-01-01'
    };

    test('should successfully get current user', async () => {
      api.get.mockResolvedValue({ data: mockUserData });

      const result = await authServices.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUserData);
    });

    test('should return user data with correct structure', async () => {
      api.get.mockResolvedValue({ data: mockUserData });

      const result = await authServices.getCurrentUser();

      expect(result.id).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('user@example.com');
    });

    test('should throw error when user is not authenticated', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401, data: { message: 'Token expired' } };
      api.get.mockRejectedValue(authError);

      await expect(authServices.getCurrentUser()).rejects.toThrow('Unauthorized');
      expect(console.log).toHaveBeenCalledWith('Current User error:', authError);
      expect(console.log).toHaveBeenCalledWith('Response status:', 401);
    });

    test('should throw error when endpoint returns 404', async () => {
      const notFoundError = new Error('User not found');
      notFoundError.response = { status: 404, data: { message: 'User not found' } };
      api.get.mockRejectedValue(notFoundError);

      await expect(authServices.getCurrentUser()).rejects.toThrow('User not found');
      expect(console.log).toHaveBeenCalledWith('Response data:', { message: 'User not found' });
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      await expect(authServices.getCurrentUser()).rejects.toThrow('Network Error');
    });

    test('should log error details on failure', async () => {
      const serverError = new Error('Server Error');
      serverError.response = { status: 500, data: { error: 'Internal server error' } };
      api.get.mockRejectedValue(serverError);

      await expect(authServices.getCurrentUser()).rejects.toThrow();
      expect(console.log).toHaveBeenCalledWith('Current User error:', serverError);
      expect(console.log).toHaveBeenCalledWith('Response status:', 500);
    });
  });

  // ==================== CHECK AUTH TESTS ====================
  describe('checkAuth', () => {
    const mockAuthData = {
      authenticated: true,
      user: {
        id: 1,
        email: 'user@example.com'
      }
    };

    test('should successfully check authentication status', async () => {
      api.get.mockResolvedValue({ data: mockAuthData });

      const result = await authServices.checkAuth();

      expect(api.get).toHaveBeenCalledWith('/auth/check');
      expect(result).toEqual(mockAuthData);
      expect(result.authenticated).toBe(true);
    });

    test('should return authenticated true when user is logged in', async () => {
      api.get.mockResolvedValue({ data: mockAuthData });

      const result = await authServices.checkAuth();

      expect(result.authenticated).toBe(true);
      expect(result.user).toBeDefined();
    });

    test('should return authenticated false when user is not logged in', async () => {
      const unauthError = new Error('Not authenticated');
      api.get.mockRejectedValue(unauthError);

      const result = await authServices.checkAuth();

      expect(result).toEqual({ authenticated: false });
      expect(result.authenticated).toBe(false);
    });

    test('should return authenticated false on 401 error', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.get.mockRejectedValue(authError);

      const result = await authServices.checkAuth();

      expect(result).toEqual({ authenticated: false });
    });

    test('should return authenticated false on network error', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      const result = await authServices.checkAuth();

      expect(result).toEqual({ authenticated: false });
      expect(console.error).toHaveBeenCalledWith('Auth check error:', networkError);
    });

    test('should not throw error, just return unauthenticated', async () => {
      api.get.mockRejectedValue(new Error('Any error'));

      expect(async () => {
        await authServices.checkAuth();
      }).not.toThrow();
    });

    test('should handle server errors gracefully', async () => {
      const serverError = new Error('Server Error');
      serverError.response = { status: 500 };
      api.get.mockRejectedValue(serverError);

      const result = await authServices.checkAuth();

      expect(result).toEqual({ authenticated: false });
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Auth Services Integration', () => {
    test('should handle complete login and logout flow', async () => {
      const loginResponse = {
        token: 'token-123',
        user: { id: 1, email: 'test@example.com' }
      };

      // Mock login
      api.post.mockResolvedValueOnce({ data: loginResponse });
      const loginResult = await authServices.login('test@example.com', 'password');
      expect(loginResult.token).toBe('token-123');

      // Mock logout
      api.post.mockResolvedValueOnce({});
      await authServices.logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    test('should handle signup followed by login', async () => {
      const signupResponse = {
        token: 'token-456',
        user: { id: 2, username: 'newuser', email: 'new@example.com' }
      };
      const loginResponse = {
        token: 'token-789',
        user: { id: 2, email: 'new@example.com' }
      };

      // Mock signup
      api.post.mockResolvedValueOnce({ data: signupResponse });
      const signupResult = await authServices.signup('newuser', 'new@example.com', 'password');
      expect(signupResult.user.username).toBe('newuser');

      // Mock login
      api.post.mockResolvedValueOnce({ data: loginResponse });
      const loginResult = await authServices.login('new@example.com', 'password');
      expect(loginResult.token).toBe('token-789');
    });

    test('should check auth after login', async () => {
      const loginResponse = {
        token: 'token-123',
        user: { id: 1, email: 'test@example.com' }
      };
      const checkAuthResponse = {
        authenticated: true,
        user: { id: 1, email: 'test@example.com' }
      };

      // Mock login
      api.post.mockResolvedValueOnce({ data: loginResponse });
      await authServices.login('test@example.com', 'password');

      // Mock checkAuth
      api.get.mockResolvedValueOnce({ data: checkAuthResponse });
      const checkResult = await authServices.checkAuth();
      expect(checkResult.authenticated).toBe(true);
    });
  });
});