// app/page.jsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Simple Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-indigo-600 rounded-lg"></div>
              <span className="font-bold text-xl text-gray-900">CloudNotes</span>
            </div>
            <Link 
              href="/login" 
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Your thoughts, perfectly organized
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Capture ideas instantly.
            <span className="block text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 mt-2">
              Organize your thoughts effortlessly.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            CloudNotes helps you create, edit, and manage notes with a fast and 
            distraction-free interface. Your ideas, always within reach.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 transition transform hover:scale-105 text-lg font-medium">
              Watch Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}