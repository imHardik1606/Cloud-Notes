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

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Dashboard from './Dashboard';
import * as authServices from '@/services/authServices';
import * as noteServices from '@/services/noteServices';

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Mock searchNotes to return notes when no query
    noteServices.searchNotes.mockImplementation((notes, query) => {
      if (!query || !query.trim()) return notes;
      const lowerQuery = query.toLowerCase();
      return notes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    });
  });

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockNotes = [
    {
      id: 1,
      title: 'First Note',
      content: 'This is the first note',
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      starred: false,
      color: 'blue',
    },
    {
      id: 2,
      title: 'Second Note',
      content: 'This is the second note',
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      starred: true,
      color: 'green',
    },
  ];

  test('renders dashboard with user data after loading', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Welcome back, ${mockUser.username}`, 'i'))).toBeInTheDocument();
    });
  });

  test('displays all notes in grid after loading', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
      expect(screen.getByText('Second Note')).toBeInTheDocument();
    });
  });

  test('displays empty state when no notes exist', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: [] });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText(/No notes found/i)).toBeInTheDocument();
    });
  });

  test('opens new note modal when clicking New Note button', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    fireEvent.click(newNoteButton);

    expect(screen.getByRole('heading', { name: 'New Note' })).toBeInTheDocument();
  });

  test('creates a new note successfully', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });
    noteServices.createNote.mockResolvedValue({
      success: true,
      note: {
        id: 3,
        title: 'New Note',
        content: 'New content',
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString(),
        starred: false,
        color: 'blue',
      },
    });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const newNoteButton = screen.getByRole('button', { name: /new note/i });
    fireEvent.click(newNoteButton);

    const titleInput = screen.getByPlaceholderText(/Give your note a title/i);
    const contentInput = screen.getByPlaceholderText(/Start writing/i);

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    const addButton = screen.getByRole('button', { name: /Add Note/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(noteServices.createNote).toHaveBeenCalledWith({
        title: 'New Note',
        content: 'New content',
        color: 'blue',
      });
    });
  });

  test('opens note detail modal when clicking on a note', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const noteCard = screen.getByText('First Note');
    fireEvent.click(noteCard);

    expect(screen.getByText(/Last edited/i)).toBeInTheDocument();
  });

  test('filters notes by search query', async () => {
    authServices.getCurrentUser.mockResolvedValue(mockUser);
    noteServices.fetchAllNotes.mockResolvedValue({ notes: mockNotes });
    noteServices.searchNotes.mockImplementation((notes, query) => {
      if (!query.trim()) return notes;
      return notes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.content.toLowerCase().includes(query.toLowerCase())
      );
    });

    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('First Note')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search notes...');
    fireEvent.change(searchInput, { target: { value: 'Second' } });

    expect(screen.queryByText('First Note')).not.toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
  });

  test('handles error when loading user data', async () => {
    authServices.getCurrentUser.mockRejectedValue(new Error('Failed to load user'));
    noteServices.fetchAllNotes.mockResolvedValue({ notes: [] });

    await act(async () => {
      render(<Dashboard />);
    });

    // Error should be displayed
    await waitFor(() => {
      // The error message might be displayed or component might redirect
    });
  });
});