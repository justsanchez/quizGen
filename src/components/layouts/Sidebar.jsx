import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FaHome, FaBook, FaCog, FaSignInAlt, FaSignOutAlt, FaUserPlus, FaBaby, FaQuestionCircle, FaReact, FaFeather } from 'react-icons/fa';
import logo from '../../assets/CartoonPenHeadFeather.png';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../firebase/auth';

const Sidebar = () => {
  const { userLoggedIn, currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/prompt',        label: 'Prompt',    icon: <FaFeather /> },
    { path: '/library', label: 'Library', icon: <FaBook /> },
    { path: '/settings',label: 'Settings',icon: <FaCog /> },
  ];

  return (
    // hidden md:block: only show on desktop
    <div className="w-64 bg-gray-800 text-white min-h-screen fixed top-0 left-0 hidden md:block flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 border-b border-gray-700 text-center">
        <Link to="/prompt" className="flex flex-col items-center space-y-2">
          <img src={logo} alt="quizGen Logo" className="w-12 h-12 invert" />
          <span className="text-2xl font-bold">quizGen</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 flex-grow">
        <ul className="space-y-2">
          {navItems.map(({ path, label, icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={() =>
                  'flex items-center p-3 rounded-lg transition-colors hover:bg-gray-700 text-gray-300'
                }
              >
                <span className="mr-3">{icon}</span>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Area at Bottom */}
      <div className="p-4 border-t border-gray-700 relative flex flex-col items-center top-96" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center justify-center">
            {userLoggedIn ? (
              currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="User"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${currentUser.displayName || 'U'}&background=random`;
                  }}
                  className="w-16 h-16 rounded-full mb-3 border-1 border-gray-700"
                  />
              ) : (
                <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-gray-600 text-xl">👤</span>
                </div>
              )
            ) : (
              <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                <FaSignInAlt className="text-white text-xl" />
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <p className="font-medium truncate">
              {userLoggedIn ? currentUser?.displayName || 'User Name' : 'Sign In'}
            </p>
            {userLoggedIn && (
              <p className="text-sm text-gray-400 truncate">
                {currentUser?.email || 'user@example.com'}
              </p>
            )}
          </div>
        </button>

        {/* Dropdown Menu (appears above profile on bottom) */}
        {isDropdownOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white text-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200">
            {userLoggedIn ? (
              <>
                <div className="px-4 py-2 text-sm border-b border-gray-100">
                  <p className="font-medium truncate">{currentUser.displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <span className="mr-2">👤</span> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:text-red-600"
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserPlus className="mr-2" /> Create Account
                </Link>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaSignInAlt className="mr-2" /> Log In
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;