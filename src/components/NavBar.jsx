import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/CartoonPenHeadFeather.png";
import { useAuth } from "../contexts/AuthContext"; // Add this import
import { logout } from "../firebase/auth";

const Navbar = () => {
  const { userLoggedIn, currentUser } = useAuth(); // Get auth state
  const [username] = useState("Alvaro Sanchez");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="w-full bg-accent-light shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left Section - Hamburger Menu */}
          <div className="flex items-center md:hidden">
            {/* Hamburger menu content */}
          </div>

          {/* Center Section - Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Link
              to="/"
              className="flex items-center space-x-1 text-2xl font-bold text-blue-300 hover:text-blue-400 transition-colors"
            >
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 object-contain invert"
              />
              <span>quizGen</span>
            </Link>
          </div>

          {/* Right Section - Authentication Links */}
          <div className="flex items-center ml-auto">
            <div className="flex items-center space-x-4">
              {userLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={
                      currentUser?.photoURL ||
                      `https://ui-avatars.com/api/?name=${
                        currentUser?.displayName || "U"
                      }&background=random`
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white-500 hover:border-white-600 transition-all"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${
                        currentUser?.displayName || "U"
                      }&background=random`;
                    }}
                  />
                </button>
  
                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium truncate">
                        {currentUser?.displayName || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser?.email}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
              ) 
              : (
                // Show login/signup links when not logged in
                <div className="flex space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;