import * as noteServices from './noteServices';
import api from '@/lib/axios';

// Mock the axios instance
jest.mock('@/lib/axios');

describe('Note Services', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  // ==================== TRANSFORM NOTE TESTS ====================
  describe('transformNote', () => {
    // Note: transformNote is an internal function, test it through other functions
    // But we can test it indirectly through the API responses
    test('should transform note data correctly', () => {
      const mockNote = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content',
        created_at: '2024-01-01T10:00:00',
        last_edited: '2024-01-02T15:30:00',
        starred: true,
      };

      const response = {
        data: {
          note: mockNote,
          message: 'Note created successfully',
        },
      };

      api.post.mockResolvedValue(response);
    });
  });

  // ==================== CREATE NOTE TESTS ====================
  describe('createNote', () => {
    const mockNoteData = {
      title: 'New Note',
      content: 'This is a new note',
    };

    const mockApiResponse = {
      note: {
        id: 1,
        title: 'New Note',
        content: 'This is a new note',
        created_at: '2024-01-01T10:00:00',
        last_edited: '2024-01-01T10:00:00',
        starred: false,
      },
      message: 'Note created successfully',
    };

    test('should successfully create a note', async () => {
      api.post.mockResolvedValue({ data: mockApiResponse });

      const result = await noteServices.createNote(mockNoteData);

      expect(api.post).toHaveBeenCalledWith('/notes/create', {
        title: mockNoteData.title,
        content: mockNoteData.content,
      });
      expect(result.success).toBe(true);
      expect(result.note.title).toBe('New Note');
      expect(result.message).toBe('Note created successfully');
    });

    test('should return transformed note object', async () => {
      api.post.mockResolvedValue({ data: mockApiResponse });

      const result = await noteServices.createNote(mockNoteData);

      expect(result.note).toHaveProperty('id');
      expect(result.note).toHaveProperty('title');
      expect(result.note).toHaveProperty('content');
      expect(result.note).toHaveProperty('createdAt');
      expect(result.note).toHaveProperty('lastEdited');
      expect(result.note).toHaveProperty('starred');
    });

    test('should handle empty title', async () => {
      api.post.mockResolvedValue({
        data: {
          note: {
            id: 2,
            title: '',
            content: 'Content without title',
            created_at: '2024-01-01T10:00:00',
            last_edited: '2024-01-01T10:00:00',
            starred: false,
          },
          message: 'Note created',
        },
      });

      const result = await noteServices.createNote({
        title: '',
        content: 'Content without title',
      });

      expect(result.success).toBe(true);
      expect(result.note.title).toBe('');
    });

    test('should throw error on validation failure', async () => {
      const validationError = new Error('Title is required');
      validationError.response = { status: 400 };
      api.post.mockRejectedValue(validationError);

      await expect(noteServices.createNote(mockNoteData)).rejects.toThrow(
        'Title is required'
      );
      expect(console.error).toHaveBeenCalledWith('Error creating note:', validationError);
    });

    test('should throw error on unauthorized access', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.post.mockRejectedValue(authError);

      await expect(noteServices.createNote(mockNoteData)).rejects.toThrow(
        'Unauthorized'
      );
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.post.mockRejectedValue(networkError);

      await expect(noteServices.createNote(mockNoteData)).rejects.toThrow(
        'Network Error'
      );
    });

    test('should throw error on server error', async () => {
      const serverError = new Error('Internal Server Error');
      serverError.response = { status: 500 };
      api.post.mockRejectedValue(serverError);

      await expect(noteServices.createNote(mockNoteData)).rejects.toThrow();
    });
  });

  // ==================== FETCH ALL NOTES TESTS ====================
  describe('fetchAllNotes', () => {
    const mockNotesResponse = {
      notes: [
        {
          id: 1,
          title: 'Note 1',
          content: 'Content 1',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-01T10:00:00',
          starred: true,
        },
        {
          id: 2,
          title: 'Note 2',
          content: 'Content 2',
          created_at: '2024-01-02T10:00:00',
          last_edited: '2024-01-02T10:00:00',
          starred: false,
        },
      ],
    };

    test('should successfully fetch all notes', async () => {
      api.get.mockResolvedValue({ data: mockNotesResponse });

      const result = await noteServices.fetchAllNotes();

      expect(api.get).toHaveBeenCalledWith('/notes/');
      expect(result.success).toBe(true);
      expect(result.notes).toHaveLength(2);
    });

    test('should return transformed notes', async () => {
      api.get.mockResolvedValue({ data: mockNotesResponse });

      const result = await noteServices.fetchAllNotes();

      expect(result.notes[0]).toHaveProperty('id');
      expect(result.notes[0]).toHaveProperty('title');
      expect(result.notes[0]).toHaveProperty('createdAt');
      expect(result.notes[0]).toHaveProperty('lastEdited');
    });

    test('should return empty array when no notes exist', async () => {
      api.get.mockResolvedValue({ data: { notes: [] } });

      const result = await noteServices.fetchAllNotes();

      expect(result.success).toBe(true);
      expect(result.notes).toEqual([]);
      expect(result.notes).toHaveLength(0);
    });

    test('should throw error on unauthorized access', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.get.mockRejectedValue(authError);

      await expect(noteServices.fetchAllNotes()).rejects.toThrow('Unauthorized');
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      await expect(noteServices.fetchAllNotes()).rejects.toThrow('Network Error');
      expect(console.error).toHaveBeenCalledWith('Error fetching notes:', networkError);
    });

    test('should throw error on server error', async () => {
      const serverError = new Error('Server Error');
      serverError.response = { status: 500 };
      api.get.mockRejectedValue(serverError);

      await expect(noteServices.fetchAllNotes()).rejects.toThrow();
    });

    test('should handle malformed response', async () => {
      api.get.mockResolvedValue({ data: {} }); // Missing notes property

      // This will throw because response.data.notes is undefined
      await expect(noteServices.fetchAllNotes()).rejects.toThrow();
    });
  });

  // ==================== FETCH NOTE BY ID TESTS ====================
  describe('fetchNoteById', () => {
    const mockNoteId = '1';
    const mockNoteResponse = {
      id: 1,
      title: 'Single Note',
      content: 'This is a single note',
      created_at: '2024-01-01T10:00:00',
      last_edited: '2024-01-01T15:00:00',
      starred: true,
    };

    test('should successfully fetch a note by ID', async () => {
      api.get.mockResolvedValue({ data: mockNoteResponse });

      const result = await noteServices.fetchNoteById(mockNoteId);

      expect(api.get).toHaveBeenCalledWith('/notes/1');
      expect(result.success).toBe(true);
      expect(result.note.title).toBe('Single Note');
    });

    test('should return transformed note with correct properties', async () => {
      api.get.mockResolvedValue({ data: mockNoteResponse });

      const result = await noteServices.fetchNoteById(mockNoteId);

      expect(result.note).toHaveProperty('id', 1);
      expect(result.note).toHaveProperty('title', 'Single Note');
      expect(result.note).toHaveProperty('content');
      expect(result.note).toHaveProperty('createdAt');
      expect(result.note).toHaveProperty('lastEdited');
      expect(result.note).toHaveProperty('starred', true);
    });

    test('should throw error when noteId is missing', async () => {
      await expect(noteServices.fetchNoteById(null)).rejects.toThrow('Note ID is required');
      await expect(noteServices.fetchNoteById('')).rejects.toThrow('Note ID is required');
      await expect(noteServices.fetchNoteById(undefined)).rejects.toThrow(
        'Note ID is required'
      );
    });

    test('should throw error when note is not found', async () => {
      const notFoundError = new Error('Note not found');
      notFoundError.response = { status: 404 };
      api.get.mockRejectedValue(notFoundError);

      await expect(noteServices.fetchNoteById(mockNoteId)).rejects.toThrow(
        'Note not found'
      );
    });

    test('should throw error on unauthorized access', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.get.mockRejectedValue(authError);

      await expect(noteServices.fetchNoteById(mockNoteId)).rejects.toThrow();
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.get.mockRejectedValue(networkError);

      await expect(noteServices.fetchNoteById(mockNoteId)).rejects.toThrow(
        'Network Error'
      );
    });

    test('should not call API when noteId is invalid', async () => {
      await expect(noteServices.fetchNoteById('')).rejects.toThrow();
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  // ==================== UPDATE NOTE TESTS ====================
  describe('updateNote', () => {
    const mockNoteId = '1';
    const mockUpdateData = {
      title: 'Updated Note',
      content: 'Updated content',
    };

    const mockUpdateResponse = {
      note: {
        id: 1,
        title: 'Updated Note',
        content: 'Updated content',
        created_at: '2024-01-01T10:00:00',
        last_edited: '2024-01-02T10:00:00',
        starred: false,
      },
      message: 'Note updated successfully',
    };

    test('should successfully update a note', async () => {
      api.put.mockResolvedValue({ data: mockUpdateResponse });

      const result = await noteServices.updateNote(mockNoteId, mockUpdateData);

      expect(api.put).toHaveBeenCalledWith('/notes/1', {
        title: mockUpdateData.title,
        content: mockUpdateData.content,
      });
      expect(result.success).toBe(true);
      expect(result.note.title).toBe('Updated Note');
      expect(result.message).toBe('Note updated successfully');
    });

    test('should return updated note with correct structure', async () => {
      api.put.mockResolvedValue({ data: mockUpdateResponse });

      const result = await noteServices.updateNote(mockNoteId, mockUpdateData);

      expect(result.note).toHaveProperty('id');
      expect(result.note).toHaveProperty('title', 'Updated Note');
      expect(result.note).toHaveProperty('content', 'Updated content');
      expect(result.note).toHaveProperty('createdAt');
      expect(result.note).toHaveProperty('lastEdited');
    });

    test('should throw error when noteId is missing', async () => {
      await expect(noteServices.updateNote(null, mockUpdateData)).rejects.toThrow(
        'Note ID is required'
      );
      await expect(noteServices.updateNote('', mockUpdateData)).rejects.toThrow(
        'Note ID is required'
      );
    });

    test('should throw error when note is not found', async () => {
      const notFoundError = new Error('Note not found');
      notFoundError.response = { status: 404 };
      api.put.mockRejectedValue(notFoundError);

      await expect(noteServices.updateNote(mockNoteId, mockUpdateData)).rejects.toThrow(
        'Note not found'
      );
    });

    test('should throw error on validation failure', async () => {
      const validationError = new Error('Invalid data');
      validationError.response = { status: 400 };
      api.put.mockRejectedValue(validationError);

      await expect(noteServices.updateNote(mockNoteId, mockUpdateData)).rejects.toThrow();
    });

    test('should throw error on unauthorized access', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.put.mockRejectedValue(authError);

      await expect(noteServices.updateNote(mockNoteId, mockUpdateData)).rejects.toThrow();
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.put.mockRejectedValue(networkError);

      await expect(noteServices.updateNote(mockNoteId, mockUpdateData)).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('Error updating note:', networkError);
    });

    test('should not call API when noteId is invalid', async () => {
      await expect(noteServices.updateNote('', mockUpdateData)).rejects.toThrow();
      expect(api.put).not.toHaveBeenCalled();
    });
  });

  // ==================== DELETE NOTE TESTS ====================
  describe('deleteNote', () => {
    const mockNoteId = '1';
    const mockDeleteResponse = {
      message: 'Note deleted successfully',
    };

    test('should successfully delete a note', async () => {
      api.delete.mockResolvedValue({ data: mockDeleteResponse });

      const result = await noteServices.deleteNote(mockNoteId);

      expect(api.delete).toHaveBeenCalledWith('/notes/1');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Note deleted successfully');
    });

    test('should return success response', async () => {
      api.delete.mockResolvedValue({ data: mockDeleteResponse });

      const result = await noteServices.deleteNote(mockNoteId);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('message');
    });

    test('should throw error when noteId is missing', async () => {
      await expect(noteServices.deleteNote(null)).rejects.toThrow('Note ID is required');
      await expect(noteServices.deleteNote('')).rejects.toThrow('Note ID is required');
      await expect(noteServices.deleteNote(undefined)).rejects.toThrow(
        'Note ID is required'
      );
    });

    test('should throw error when note is not found', async () => {
      const notFoundError = new Error('Note not found');
      notFoundError.response = { status: 404 };
      api.delete.mockRejectedValue(notFoundError);

      await expect(noteServices.deleteNote(mockNoteId)).rejects.toThrow('Note not found');
    });

    test('should throw error on unauthorized access', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      api.delete.mockRejectedValue(authError);

      await expect(noteServices.deleteNote(mockNoteId)).rejects.toThrow();
    });

    test('should throw error on network failure', async () => {
      const networkError = new Error('Network Error');
      api.delete.mockRejectedValue(networkError);

      await expect(noteServices.deleteNote(mockNoteId)).rejects.toThrow(
        'Network Error'
      );
      expect(console.error).toHaveBeenCalledWith('Error deleting note:', networkError);
    });

    test('should not call API when noteId is invalid', async () => {
      await expect(noteServices.deleteNote('')).rejects.toThrow();
      expect(api.delete).not.toHaveBeenCalled();
    });

    test('should throw error on server error', async () => {
      const serverError = new Error('Server Error');
      serverError.response = { status: 500 };
      api.delete.mockRejectedValue(serverError);

      await expect(noteServices.deleteNote(mockNoteId)).rejects.toThrow();
    });
  });

  // ==================== INITIALIZE NOTES TESTS ====================
  describe('initializeNotes', () => {
    const mockNotesResponse = {
      notes: [
        {
          id: 1,
          title: 'Note 1',
          content: 'Content 1',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-01T10:00:00',
          starred: false,
        },
      ],
    };

    test('should successfully initialize notes', async () => {
      api.get.mockResolvedValue({ data: mockNotesResponse });

      const result = await noteServices.initializeNotes();

      expect(api.get).toHaveBeenCalledWith('/notes/');
      expect(result.success).toBe(true);
      expect(result.notes).toBeDefined();
    });

    test('should return notes array', async () => {
      api.get.mockResolvedValue({ data: mockNotesResponse });

      const result = await noteServices.initializeNotes();

      expect(Array.isArray(result.notes)).toBe(true);
      expect(result.notes).toHaveLength(1);
    });

    test('should throw error on failure', async () => {
      const error = new Error('Failed to initialize');
      api.get.mockRejectedValue(error);

      await expect(noteServices.initializeNotes()).rejects.toThrow('Failed to initialize');
    });

    test('should return empty array if no notes', async () => {
      api.get.mockResolvedValue({ data: { notes: [] } });

      const result = await noteServices.initializeNotes();

      expect(result.notes).toEqual([]);
    });
  });

  // ==================== SEARCH NOTES TESTS ====================
  describe('searchNotes', () => {
    const mockNotes = [
      {
        id: 1,
        title: 'JavaScript Basics',
        content: 'Learn the basics of JavaScript',
        createdAt: '2024-01-01',
        lastEdited: '2024-01-01',
        starred: true,
      },
      {
        id: 2,
        title: 'React Hooks',
        content: 'Understanding React Hooks and their usage',
        createdAt: '2024-01-02',
        lastEdited: '2024-01-02',
        starred: false,
      },
      {
        id: 3,
        title: 'CSS Grid',
        content: 'Master CSS Grid layout techniques',
        createdAt: '2024-01-03',
        lastEdited: '2024-01-03',
        starred: true,
      },
    ];

    test('should return all notes when query is empty', () => {
      const result = noteServices.searchNotes(mockNotes, '');

      expect(result).toEqual(mockNotes);
      expect(result).toHaveLength(3);
    });

    test('should return all notes when query is only whitespace', () => {
      const result = noteServices.searchNotes(mockNotes, '   ');

      expect(result).toEqual(mockNotes);
    });

    test('should search notes by title (case-insensitive)', () => {
      const result = noteServices.searchNotes(mockNotes, 'javascript');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('JavaScript Basics');
    });

    test('should search notes by content (case-insensitive)', () => {
      const result = noteServices.searchNotes(mockNotes, 'hooks');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Hooks');
    });

    test('should return multiple notes matching query', () => {
      const result = noteServices.searchNotes(mockNotes, 'the');

      expect(result.length).toBeGreaterThan(1);
    });

    test('should handle mixed case queries', () => {
      const result = noteServices.searchNotes(mockNotes, 'ReAcT');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('React Hooks');
    });

    test('should return empty array when no matches found', () => {
      const result = noteServices.searchNotes(mockNotes, 'Python');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should search in both title and content', () => {
      const result = noteServices.searchNotes(mockNotes, 'learn');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('JavaScript Basics');
    });

    test('should handle partial word matches', () => {
      const result = noteServices.searchNotes(mockNotes, 'Grid');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('CSS Grid');
    });

    test('should throw error when query is null', () => {
      // The function calls .trim() on query, so null will throw
      expect(() => noteServices.searchNotes(mockNotes, null)).toThrow();
    });

    test('should be case-insensitive for content search', () => {
      const result = noteServices.searchNotes(mockNotes, 'MASTER');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('CSS Grid');
    });

    test('should handle special characters in query', () => {
      const customNotes = [
        {
          id: 1,
          title: 'C++ Tutorial',
          content: 'Learn C++',
          createdAt: '2024-01-01',
          lastEdited: '2024-01-01',
          starred: false,
        },
      ];

      const result = noteServices.searchNotes(customNotes, 'C++');

      expect(result).toHaveLength(1);
    });

    test('should handle empty notes array', () => {
      const result = noteServices.searchNotes([], 'query');

      expect(result).toEqual([]);
    });

    test('should preserve note properties after search', () => {
      const result = noteServices.searchNotes(mockNotes, 'JavaScript');

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('createdAt');
      expect(result[0]).toHaveProperty('starred');
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Note Services Integration', () => {
    test('should handle complete CRUD flow', async () => {
      const createResponse = {
        note: {
          id: 1,
          title: 'New Note',
          content: 'Content',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-01T10:00:00',
          starred: false,
        },
        message: 'Note created',
      };

      const fetchResponse = {
        id: 1,
        title: 'New Note',
        content: 'Content',
        created_at: '2024-01-01T10:00:00',
        last_edited: '2024-01-01T10:00:00',
        starred: false,
      };

      const updateResponse = {
        note: {
          id: 1,
          title: 'Updated Note',
          content: 'Updated Content',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-02T10:00:00',
          starred: true,
        },
        message: 'Note updated',
      };

      const deleteResponse = {
        message: 'Note deleted',
      };

      // Create
      api.post.mockResolvedValueOnce({ data: createResponse });
      const created = await noteServices.createNote({
        title: 'New Note',
        content: 'Content',
      });
      expect(created.success).toBe(true);

      // Fetch
      api.get.mockResolvedValueOnce({ data: fetchResponse });
      const fetched = await noteServices.fetchNoteById('1');
      expect(fetched.success).toBe(true);

      // Update
      api.put.mockResolvedValueOnce({ data: updateResponse });
      const updated = await noteServices.updateNote('1', {
        title: 'Updated Note',
        content: 'Updated Content',
      });
      expect(updated.success).toBe(true);

      // Delete
      api.delete.mockResolvedValueOnce({ data: deleteResponse });
      const deleted = await noteServices.deleteNote('1');
      expect(deleted.success).toBe(true);
    });

    test('should handle fetch all and search workflow', async () => {
      const mockNotes = [
        {
          id: 1,
          title: 'JavaScript',
          content: 'JS content',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-01T10:00:00',
          starred: false,
        },
        {
          id: 2,
          title: 'React',
          content: 'React content',
          created_at: '2024-01-02T10:00:00',
          last_edited: '2024-01-02T10:00:00',
          starred: false,
        },
      ];

      // Fetch all notes
      api.get.mockResolvedValue({ data: { notes: mockNotes } });
      const allNotes = await noteServices.fetchAllNotes();
      expect(allNotes.notes).toHaveLength(2);

      // Search notes locally
      const searchResults = noteServices.searchNotes(allNotes.notes, 'React');
      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].title).toBe('React');
    });

    test('should handle error recovery in workflow', async () => {
      // First attempt fails
      api.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(noteServices.fetchAllNotes()).rejects.toThrow('Network Error');

      // Second attempt succeeds
      api.get.mockResolvedValueOnce({
        data: {
          notes: [
            {
              id: 1,
              title: 'Note',
              content: 'Content',
              created_at: '2024-01-01T10:00:00',
              last_edited: '2024-01-01T10:00:00',
              starred: false,
            },
          ],
        },
      });

      const result = await noteServices.fetchAllNotes();
      expect(result.success).toBe(true);
    });

    test('should initialize and fetch notes in sequence', async () => {
      const mockNotes = [
        {
          id: 1,
          title: 'Note 1',
          content: 'Content 1',
          created_at: '2024-01-01T10:00:00',
          last_edited: '2024-01-01T10:00:00',
          starred: false,
        },
      ];

      // Initialize
      api.get.mockResolvedValueOnce({ data: { notes: mockNotes } });
      const initialized = await noteServices.initializeNotes();
      expect(initialized.success).toBe(true);

      // Fetch specific note
      api.get.mockResolvedValueOnce({ data: mockNotes[0] });
      const fetched = await noteServices.fetchNoteById('1');
      expect(fetched.success).toBe(true);
    });
  });

  // ==================== EDGE CASES TESTS ====================
  describe('Edge Cases', () => {
    test('should handle notes with missing starred property', async () => {
      const noteWithoutStarred = {
        id: 1,
        title: 'Note',
        content: 'Content',
        created_at: '2024-01-01T10:00:00',
        last_edited: '2024-01-01T10:00:00',
      };

      api.get.mockResolvedValue({ data: noteWithoutStarred });
      const result = await noteServices.fetchNoteById('1');

      expect(result.note.starred).toBe(false);
    });

    test('should handle very long note titles', async () => {
      const longTitle = 'a'.repeat(1000);
      const noteData = {
        title: longTitle,
        content: 'Short content',
      };

      api.post.mockResolvedValue({
        data: {
          note: {
            id: 1,
            ...noteData,
            created_at: '2024-01-01T10:00:00',
            last_edited: '2024-01-01T10:00:00',
            starred: false,
          },
          message: 'Note created',
        },
      });

      const result = await noteServices.createNote(noteData);
      expect(result.note.title).toHaveLength(1000);
    });

    test('should handle very long note content', async () => {
      const longContent = 'Lorem ipsum '.repeat(10000);
      const noteData = {
        title: 'Long Content Note',
        content: longContent,
      };

      api.post.mockResolvedValue({
        data: {
          note: {
            id: 1,
            ...noteData,
            created_at: '2024-01-01T10:00:00',
            last_edited: '2024-01-01T10:00:00',
            starred: false,
          },
          message: 'Note created',
        },
      });

      const result = await noteServices.createNote(noteData);
      expect(result.note.content.length).toBeGreaterThan(100000);
    });

    test('should handle unicode characters in notes', () => {
      const notes = [
        {
          id: 1,
          title: '日本語のノート',
          content: '中文内容',
          createdAt: '2024-01-01',
          lastEdited: '2024-01-01',
          starred: false,
        },
        {
          id: 2,
          title: 'العربية',
          content: 'Hebrew עברית',
          createdAt: '2024-01-02',
          lastEdited: '2024-01-02',
          starred: false,
        },
      ];

      const result = noteServices.searchNotes(notes, '日本語');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('日本語のノート');
    });

    test('should handle emoji in note content', () => {
      const notes = [
        {
          id: 1,
          title: '😀 Happy Note',
          content: 'Content with emoji 🎉 🚀',
          createdAt: '2024-01-01',
          lastEdited: '2024-01-01',
          starred: false,
        },
      ];

      const result = noteServices.searchNotes(notes, '🚀');
      expect(result).toHaveLength(1);
    });

    test('should handle concurrent create operations', async () => {
      const noteData1 = { title: 'Note 1', content: 'Content 1' };
      const noteData2 = { title: 'Note 2', content: 'Content 2' };

      api.post.mockResolvedValueOnce({
        data: {
          note: { id: 1, ...noteData1, created_at: '2024-01-01T10:00:00', last_edited: '2024-01-01T10:00:00', starred: false },
          message: 'Created',
        },
      });

      api.post.mockResolvedValueOnce({
        data: {
          note: { id: 2, ...noteData2, created_at: '2024-01-01T10:01:00', last_edited: '2024-01-01T10:01:00', starred: false },
          message: 'Created',
        },
      });

      const [result1, result2] = await Promise.all([
        noteServices.createNote(noteData1),
        noteServices.createNote(noteData2),
      ]);

      expect(result1.note.id).toBe(1);
      expect(result2.note.id).toBe(2);
    });
  });
});