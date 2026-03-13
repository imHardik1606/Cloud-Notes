// app/dashboard/page.jsx
"use client";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/services/authServices";
import {
  createNote,
  fetchAllNotes,
  fetchNoteById,
  updateNote,
  deleteNote,
  searchNotes,
} from "@/services/noteServices";
import { useRouter } from "next/navigation";
import {
  FiSearch,
  FiPlus,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiStar,
  FiFolder,
  FiEdit2,
  FiTrash2,
  FiMoon,
  FiSun,
} from "react-icons/fi";

// Color utility
const getColorFromId = (id) => {
  const colors = ["blue", "green", "purple", "yellow", "pink", "orange"];
  return colors[id % colors.length];
};

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    color: "blue",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Fetch user and notes on mount
  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        // Fetch user
        const userData = await getCurrentUser();
        setUser(userData);

        // Fetch notes
        const notesResult = await fetchAllNotes();
        setNotes(notesResult.notes);
        setError(null);
      } catch (err) {
        console.error("Error:", err);
        if (err.response?.status === 401) {
          router.push("/login");
        } else {
          setError(
            err.response?.data?.message || err.message || "Failed to load data",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, [router]);

  // Add new note
  const handleAddNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;

    setIsSaving(true);
    try {
      const result = await createNote({
        title: newNote.title.trim() || "Untitled",
        content: newNote.content.trim(),
        color: newNote.color,
      });

      setNotes([result.note, ...notes]);
      setNewNote({ title: "", content: "", color: "blue" });
      setIsNewNoteOpen(false);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        "Error creating note";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Update existing note
  const handleUpdateNote = async () => {
    if (!selectedNote?.id) return;

    setIsSaving(true);
    try {
      const result = await updateNote(selectedNote.id, {
        title: newNote.title.trim() || "Untitled",
        content: newNote.content.trim(),
        color: newNote.color,
      });

      // Update notes list
      setNotes(
        notes.map((n) =>
          n.id === selectedNote.id ? { ...result.note, starred: n.starred } : n,
        ),
      );

      // Auto-close modal after successful update
      setSelectedNote(null);
      setIsEditMode(false);
      setNewNote({ title: "", content: "", color: "blue" });
      setIsNewNoteOpen(false);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        "Error updating note";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((n) => n.id !== noteId));
      setSelectedNote(null);
      setDeleteConfirmModal(null);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error deleting note";
      setError(errorMessage);
      console.error(err);
    }
  };

  // Start editing a note
  const handleEditNote = (note) => {
    setSelectedNote(note);
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color || "blue",
    });
    setIsEditMode(true);
    setIsNewNoteOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredNotes = searchNotes(notes, searchQuery);

  const getColorClasses = (color, isDark = false) => {
    if (isDark) {
      const darkColors = {
        blue: "bg-blue-950/30 border-l-4 border-blue-500 hover:bg-blue-900/40",
        green: "bg-green-950/30 border-l-4 border-green-500 hover:bg-green-900/40",
        purple: "bg-purple-950/30 border-l-4 border-purple-500 hover:bg-purple-900/40",
        yellow: "bg-yellow-950/30 border-l-4 border-yellow-500 hover:bg-yellow-900/40",
        pink: "bg-pink-950/30 border-l-4 border-pink-500 hover:bg-pink-900/40",
        orange: "bg-orange-950/30 border-l-4 border-orange-500 hover:bg-orange-900/40",
        red: "bg-red-950/30 border-l-4 border-red-500 hover:bg-red-900/40",
        indigo: "bg-indigo-950/30 border-l-4 border-indigo-500 hover:bg-indigo-900/40",
      };
      return darkColors[color] || darkColors.blue;
    } else {
      const lightColors = {
        blue: "bg-blue-50 border-l-4 border-blue-500",
        green: "bg-green-50 border-l-4 border-green-500",
        purple: "bg-purple-50 border-l-4 border-purple-500",
        yellow: "bg-yellow-50 border-l-4 border-yellow-500",
        pink: "bg-pink-50 border-l-4 border-pink-500",
        orange: "bg-orange-50 border-l-4 border-orange-500",
        red: "bg-red-50 border-l-4 border-red-500",
        indigo: "bg-indigo-50 border-l-4 border-indigo-500",
      };
      return lightColors[color] || lightColors.blue;
    }
  };

  const colorOptions = [
    {
      name: "blue",
      label: "Blue",
      bg: "bg-blue-100 dark:bg-blue-900/50",
      border: "border-blue-400 dark:border-blue-600",
    },
    {
      name: "green",
      label: "Green",
      bg: "bg-green-100 dark:bg-green-900/50",
      border: "border-green-400 dark:border-green-600",
    },
    {
      name: "purple",
      label: "Purple",
      bg: "bg-purple-100 dark:bg-purple-900/50",
      border: "border-purple-400 dark:border-purple-600",
    },
    {
      name: "yellow",
      label: "Yellow",
      bg: "bg-yellow-100 dark:bg-yellow-900/50",
      border: "border-yellow-400 dark:border-yellow-600",
    },
    {
      name: "pink",
      label: "Pink",
      bg: "bg-pink-100 dark:bg-pink-900/50",
      border: "border-pink-400 dark:border-pink-600",
    },
    {
      name: "orange",
      label: "Orange",
      bg: "bg-orange-100 dark:bg-orange-900/50",
      border: "border-orange-400 dark:border-orange-600",
    },
    { name: "red", label: "Red", bg: "bg-red-100 dark:bg-red-900/50", border: "border-red-400 dark:border-red-600" },
    {
      name: "indigo",
      label: "Indigo",
      bg: "bg-indigo-100 dark:bg-indigo-900/50",
      border: "border-indigo-400 dark:border-indigo-600",
    },
  ];

  const starredCount = notes.filter((n) => n.starred).length;

  // Format date/time based on creation time
  const formatNoteDate = (createdAt) => {
    const noteDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now - noteDate;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      // Show time for notes created in last 24 hours
      return noteDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } else {
      // Show date for older notes
      return noteDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          noteDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-linear-to-br from-gray-900 to-gray-800' : 'bg-gray-50'}`}>
      {/* Top Navigation */}
      <nav className={`fixed top-0 w-full z-30 transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700' 
          : 'bg-white border-gray-200'
      } border-b`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden p-2 rounded-md transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                } mr-2`}
              >
                {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg shadow-lg"></div>
                <span className={`font-bold text-xl hidden sm:block transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  CloudNotes
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className={`h-5 w-5 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } border`}
                  placeholder="Search notes..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              <button className={`p-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <FiUser size={20} />
              </button>
              <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {/* Sidebar */}
<div
  className={`fixed inset-y-0 left-0 transform ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } lg:translate-x-0 transition duration-200 ease-in-out z-20 w-64 ${
    isDarkMode 
      ? 'bg-gray-800/95 backdrop-blur-sm border-gray-700' 
      : 'bg-white border-gray-200'
  } border-r`}
>
  <div className="flex flex-col h-full pt-16 pb-4 px-4 justify-center">
    <div className="space-y-1">
      <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isDarkMode 
          ? 'text-white bg-gray-700' 
          : 'text-gray-700 bg-gray-100'
      }`}>
        <FiFolder className="h-5 w-5" />
        <span>All Notes</span>
        <span className={`ml-auto text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {notes.length}
        </span>
      </button>
      <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isDarkMode 
          ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}>
        <FiStar className="h-5 w-5" />
        <span>Starred</span>
        <span className={`ml-auto text-sm ${
          isDarkMode ? 'text-gray-500' : 'text-gray-500'
        }`}>
          {starredCount}
        </span>
      </button>
    </div>

    <div className="mt-6">
      <button
        onClick={() => {
          setIsEditMode(false);
          setNewNote({ title: "", content: "", color: "blue" });
          setIsNewNoteOpen(true);
        }}
        className={`w-full py-3 px-4 rounded-lg transition font-medium flex items-center justify-center space-x-2 ${
          isDarkMode
            ? 'bg-gray-900 text-white hover:bg-gray-800' 
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        <FiPlus size={18} />
        <span>New Note</span>
      </button>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className={`text-2xl font-bold transition-colors ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome back, {user?.username || "User"}!
            </h1>
            <p className={`mt-1 transition-colors ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You have {notes.length} notes. Keep up the great work!
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <FiX size={18} />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin">
                <FiSearch className={`h-8 w-8 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                }`} />
              </div>
            </div>
          ) : filteredNotes.length > 0 ? (
            /* Notes Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => {
                const color = note.color || "blue";
                return (
                  <div
                    key={note.id}
                    className={`${getColorClasses(color, isDarkMode)} rounded-xl p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer ${
                      isDarkMode ? 'shadow-black/20' : ''
                    }`}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditMode(false);
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`font-semibold text-lg line-clamp-1 flex-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {note.title}
                      </h3>
                      {note.starred && (
                        <FiStar className="h-5 w-5 text-yellow-500 fill-yellow-500 ml-2" />
                      )}
                    </div>
                    <p className={`text-sm line-clamp-3 mb-4 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {note.content}
                    </p>
                    <div className={`flex justify-between items-center text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <span>{formatNoteDate(note.createdAt)}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNote(note);
                          }}
                          className={`p-1 rounded transition ${
                            isDarkMode 
                              ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                              : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'
                          }`}
                          title="Edit note"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmModal(note.id);
                          }}
                          className={`p-1 rounded transition ${
                            isDarkMode 
                              ? 'hover:bg-white/10 text-red-400 hover:text-red-300' 
                              : 'hover:bg-white/50 text-red-600 hover:text-red-800'
                          }`}
                          title="Delete note"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12">
              <div className={`mb-4 transition-colors ${
                isDarkMode ? 'text-gray-700' : 'text-gray-400'
              }`}>
                <FiSearch className="h-12 w-12 mx-auto" />
              </div>
              <h3 className={`text-lg font-medium mb-2 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No notes found
              </h3>
              <p className={`transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {searchQuery
                  ? "Try searching with different keywords"
                  : "Create your first note to get started"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New/Edit Note Modal */}
      {isNewNoteOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-2xl max-w-lg w-full shadow-2xl transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center px-6 pt-6 pb-4 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-linear-to-br from-blue-600 to-indigo-600 rounded-md"></div>
                <h2 className={`text-lg font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {isEditMode ? "Edit Note" : "New Note"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsNewNoteOpen(false);
                  setIsEditMode(false);
                  setNewNote({ title: "", content: "" });
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                }`}
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) =>
                    setNewNote({ ...newNote, title: e.target.value })
                  }
                  placeholder="Give your note a title..."
                  className={`w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } border`}
                  autoFocus
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) =>
                    setNewNote({ ...newNote, content: e.target.value })
                  }
                  placeholder="Start writing..."
                  rows={5}
                  className={`w-full px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } border`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 px-6 pb-6">
              <button
                onClick={() => {
                  setIsNewNoteOpen(false);
                  setIsEditMode(false);
                  setNewNote({ title: "", content: "", color: "blue" });
                }}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleUpdateNote : handleAddNote}
                disabled={
                  (!newNote.title.trim() && !newNote.content.trim()) || isSaving
                }
                className={`px-5 py-2 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 ${
                  isDarkMode
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                <FiPlus size={15} />
                <span>
                  {isSaving ? "Saving..." : isEditMode ? "Update" : "Add"} Note
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal (Read-only) */}
      {selectedNote && !isEditMode && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className={`text-2xl font-bold transition-colors ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {selectedNote.title}
                </h2>
                <button
                  onClick={() => setSelectedNote(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <FiX size={20} />
                </button>
              </div>
              <p className={`whitespace-pre-wrap mb-6 transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {selectedNote.content}
              </p>
              <div className={`text-sm pb-6 transition-colors ${
                isDarkMode ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <p>
                  Last edited:{" "}
                  {new Date(selectedNote.lastEdited).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className={`rounded-2xl max-w-sm w-full shadow-2xl transition-colors ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <FiTrash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className={`text-lg font-bold text-center mb-2 transition-colors ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Note?
              </h3>
              <p className={`text-center mb-6 transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Are you sure you want to delete this note? This action cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmModal(null)}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteNote(deleteConfirmModal)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center justify-center space-x-2"
                >
                  <FiTrash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}