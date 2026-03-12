"use client";
import { useState, useEffect } from "react";
import { getCurrentUser } from "@/services/authServices";
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
} from "react-icons/fi";

// Sample notes data
const sampleNotes = [
  {
    id: 1,
    title: "Meeting Notes - Project Alpha",
    content:
      "Discussed Q4 goals, timeline for launch, and resource allocation. Next meeting scheduled for Friday...",
    date: "2 hours ago",
    starred: true,
    color: "blue",
  },
  {
    id: 2,
    title: "Weekly Task List",
    content:
      "1. Complete dashboard design\n2. Review pull requests\n3. Update documentation\n4. Team meeting at 3pm...",
    date: "Yesterday",
    starred: false,
    color: "green",
  },
  {
    id: 3,
    title: "Ideas for Blog Post",
    content:
      "Topic ideas: Productivity tips for remote workers, How to organize digital notes effectively, The future of...",
    date: "Yesterday",
    starred: true,
    color: "purple",
  },
  {
    id: 4,
    title: "Book Recommendations",
    content:
      "Atomic Habits - James Clear, Deep Work - Cal Newport, The Pragmatic Programmer - David Thomas...",
    date: "3 days ago",
    starred: false,
    color: "yellow",
  },
  {
    id: 5,
    title: "React Best Practices",
    content:
      "Use functional components with hooks, implement proper error boundaries, optimize with useMemo and useCallback...",
    date: "5 days ago",
    starred: false,
    color: "pink",
  },
  {
    id: 6,
    title: "Grocery Shopping List",
    content:
      "Milk, eggs, bread, vegetables, fruits, coffee, pasta, olive oil, snacks for the week...",
    date: "1 week ago",
    starred: true,
    color: "orange",
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState(sampleNotes);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", color: "blue" });

  const colorOptions = ["blue", "green", "purple", "yellow", "pink", "orange"];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        console.log("User data:", data);
        setUser(data);
      } catch (error) {
        console.log("Failed to fetch user:", error.response?.data || error.message);
        // Optionally redirect to login if unauthorized
        if (error.response?.status === 401) {
          router.push("/login");
        }
      }
    }

    fetchUser();
  }, [])

  const handleAddNote = () => {
    if (!newNote.title.trim() && !newNote.content.trim()) return;
    const note = {
      id: Date.now(),
      title: newNote.title.trim() || "Untitled",
      content: newNote.content.trim(),
      date: "Just now",
      starred: false,
      color: newNote.color,
    };
    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", color: "blue" });
    setIsNewNoteOpen(false);
  };

  const handleLogout = () => {
    router.push("/login");
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-50 border-l-4 border-blue-500",
      green: "bg-green-50 border-l-4 border-green-500",
      purple: "bg-purple-50 border-l-4 border-purple-500",
      yellow: "bg-yellow-50 border-l-4 border-yellow-500",
      pink: "bg-pink-50 border-l-4 border-pink-500",
      orange: "bg-orange-50 border-l-4 border-orange-500",
    };
    return colors[color] || "bg-gray-50 border-l-4 border-gray-500";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 w-full z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and mobile menu */}
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">
                  CloudNotes
                </span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search notes..."
                />
              </div>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition">
                <FiUser size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 transition duration-200 ease-in-out z-20 w-64 bg-white border-r border-gray-200`}
      >
        {/* FIX: sidebar content centered vertically, accounting for navbar height */}
        <div className="flex flex-col h-full pt-16 pb-4 px-4 justify-center">
          <div className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 bg-gray-100 rounded-lg">
              <FiFolder className="h-5 w-5" />
              <span>All Notes</span>
              <span className="ml-auto text-sm text-gray-500">
                {notes.length}
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
              <FiStar className="h-5 w-5" />
              <span>Starred</span>
              <span className="ml-auto text-sm text-gray-500">
                {notes.filter((n) => n.starred).length}
              </span>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={() => setIsNewNoteOpen(true)}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition font-medium flex items-center justify-center space-x-2"
            >
              <FiPlus size={18} />
              <span>New Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content — FIX: pt-16 clears the fixed navbar, no extra space */}
      <div className="lg:ml-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              You have {notes.length} notes. Keep up the great work!
            </p>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`${getColorClasses(note.color)} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                      {note.title}
                    </h3>
                    {note.starred && (
                      <FiStar className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{note.date}</span>
                    <span className="px-2 py-1 bg-white/50 rounded-full">
                      Click to edit
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiSearch className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notes found
              </h3>
              <p className="text-gray-600">
                Try searching with different keywords
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Note Modal */}
      {isNewNoteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-linear-to-br from-blue-600 to-indigo-600 rounded-md"></div>
                <h2 className="text-lg font-bold text-gray-900">New Note</h2>
              </div>
              <button
                onClick={() => { setIsNewNoteOpen(false); setNewNote({ title: "", content: "", color: "blue" }); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-900"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Give your note a title..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  autoFocus
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Content
                </label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Start writing..."
                  rows={5}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Note Color
                </label>
                <div className="flex items-center space-x-2">
                  {colorOptions.map((c) => {
                    const dotColors = {
                      blue: "bg-blue-500",
                      green: "bg-green-500",
                      purple: "bg-purple-500",
                      yellow: "bg-yellow-500",
                      pink: "bg-pink-500",
                      orange: "bg-orange-500",
                    };
                    return (
                      <button
                        key={c}
                        onClick={() => setNewNote({ ...newNote, color: c })}
                        className={`w-7 h-7 rounded-full ${dotColors[c]} transition-all duration-150 ${
                          newNote.color === c
                            ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                            : "hover:scale-105 opacity-70 hover:opacity-100"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Preview strip */}
              <div className={`${getColorClasses(newNote.color)} rounded-lg px-4 py-3`}>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Preview</p>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {newNote.title || "Untitled"}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                  {newNote.content || "No content yet..."}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 px-6 pb-6">
              <button
                onClick={() => { setIsNewNoteOpen(false); setNewNote({ title: "", content: "", color: "blue" }); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!newNote.title.trim() && !newNote.content.trim()}
                className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <FiPlus size={15} />
                <span>Add Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedNote.title}
                </h2>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX size={20} />
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap mb-4">
                {selectedNote.content}
              </p>
              <div className="text-sm text-gray-500">
                Last updated: {selectedNote.date}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}