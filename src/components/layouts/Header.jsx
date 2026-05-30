import React from 'react';
import { useState } from 'react';
import MobileMenu from './MobileMenu';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Mobile-only top bar (`md:hidden`) with a hamburger that toggles `MobileMenu`.
 * The desktop equivalent is `Sidebar`.
 *
 * @component
 * @param {Object} props
 * @param {import('firebase/auth').User} [props.user] - Forwarded to `MobileMenu`.
 * @returns {JSX.Element}
 */
const Header = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

//   const { userLoggedIn, currentUser } = useAuth();

  return (
    <>
    {/* Only shows in the mobile view */}
      <header className="bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-30 md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button 
              onClick={toggleMenu}
              className="mr-4 md:hidden text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl text-white font-semibold">quizGen</h1>
          </div>
         
        </div>
      </header>
      
      <MobileMenu 
        isOpen={isMenuOpen} 
        toggleMenu={toggleMenu} 
        user={user} 
      />
    </>
  );
};

export default Header;