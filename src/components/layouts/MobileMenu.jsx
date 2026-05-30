import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    FaHome, // will be used in the future
    FaFeather,
    FaBook,
    FaCog,
    FaSignInAlt,
    FaSignOutAlt,
  FaUserPlus,
} from 'react-icons/fa';
import logo from '../../assets/CartoonPenHeadFeather.png';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../firebase/auth';

/**
 * Slide-out drawer rendered alongside `Header` on mobile. Locks body scroll
 * while open, exposes the same nav links as the desktop `Sidebar`, and
 * surfaces sign-in / sign-out actions.
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the drawer is visible.
 * @param {() => void} props.toggleMenu - Toggles `isOpen` from a parent.
 * @returns {JSX.Element}
 */
const MobileMenu = ({ isOpen, toggleMenu }) => {
  const { userLoggedIn, currentUser } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      toggleMenu();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/prompt', label: 'Prompt', icon: <FaFeather /> },
    { path: '/library', label: 'Library', icon: <FaBook /> },
    { path: '/settings', label: 'Settings', icon: <FaCog /> },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        // md:hidden: only show on mobile
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700 text-center">
          <Link
            to="/"
            onClick={toggleMenu}
            className="flex flex-col items-center space-y-2"
          >
            <img src={logo} alt="QuizGen" className="w-12 h-12" />
            <span className="text-xl font-bold">QuizGen</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="p-4 flex-grow overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(({ path, label, icon }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={toggleMenu}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'hover:bg-gray-700 hover:text-white'
                    }`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-700" />

        {/* Auth actions */}
        <div className="p-4" ref={dropdownRef}>
          {userLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt /> <span>Sign Out</span>
            </button>
          ) : (
            <div className="space-y-2">
              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 rounded-lg transition-colors"
              >
                <FaSignInAlt /> <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gray-600 transition-colors"
              >
                <FaUserPlus /> <span>Create Account</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;