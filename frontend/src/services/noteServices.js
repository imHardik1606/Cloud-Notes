// services/noteServices.js
import api from "@/lib/axios";

/**
 * Transform note data from API response
 */
const transformNote = (note) => ({
  id: note.id,
  title: note.title,
  content: note.content,
  createdAt: note.created_at,
  lastEdited: note.last_edited,
  starred: note.starred || false,
});

/**
 * Create a new note
 * @param {Object} noteData - { title, content }
 * @returns {Promise<Object>} Created note object
 */
export const createNote = async (noteData) => {
  try {
    const response = await api.post("/notes/create", {
      title: noteData.title,
      content: noteData.content,
    });
    return {
      success: true,
      note: transformNote(response.data.note),
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

/**
 * Fetch all notes for the current user
 * @returns {Promise<Object>} { notes: Array, success: boolean }
 */
export const fetchAllNotes = async () => {
  try {
    const response = await api.get("/notes/");
    const transformedNotes = response.data.notes.map(transformNote);
    return {
      success: true,
      notes: transformedNotes,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    throw error;
  }
};

/**
 * Fetch a single note by ID
 * @param {string} noteId - The ID of the note to fetch
 * @returns {Promise<Object>} Single note object
 */
export const fetchNoteById = async (noteId) => {
  try {
    if (!noteId) {
      throw new Error("Note ID is required");
    }

    const response = await api.get(`/notes/${noteId}`);
    return {
      success: true,
      note: transformNote(response.data),
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
};

/**
 * Update an existing note
 * @param {string} noteId - The ID of the note to update
 * @param {Object} noteData - { title, content }
 * @returns {Promise<Object>} Updated note object
 */
export const updateNote = async (noteId, noteData) => {
  try {
    if (!noteId) {
      throw new Error("Note ID is required");
    }

    const response = await api.put(`/notes/${noteId}`, {
      title: noteData.title,
      content: noteData.content,
    });

    return {
      success: true,
      note: transformNote(response.data.note),
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

/**
 * Delete a note
 * @param {string} noteId - The ID of the note to delete
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const deleteNote = async (noteId) => {
  try {
    if (!noteId) {
      throw new Error("Note ID is required");
    }

    const response = await api.delete(`/notes/${noteId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

/**
 * Batch fetch notes with error handling
 * Useful for preloading notes
 * @returns {Promise<Object>}
 */
export const initializeNotes = async () => {
  return fetchAllNotes();
};

/**
 * Search notes locally (client-side)
 * @param {Array} notes - Array of notes to search
 * @param {string} query - Search query
 * @returns {Array} Filtered notes
 */
export const searchNotes = (notes, query) => {
  if (!query.trim()) return notes;

  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
};