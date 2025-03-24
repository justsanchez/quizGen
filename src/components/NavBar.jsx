import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import QuizPage from './QuizAndNotesPage.jsx'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [username] = useState('Alvaro Sanchez');

  return (
    <nav className=" w-full bg-accent-light shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left Section - Hamburger Menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-primary hover:text-primary-light focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Center Section - Title (Always centered) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              quizGen
            </Link>
          </div>

          {/* Right Section - User Profile */}
          <div className="flex items-center ml-auto">
            <div className="flex items-center space-x-2">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors">
                {username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
            >
              Home
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;