import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/CartoonPenHeadFeather.png";

const Navbar = () => {
  const [username] = useState("Alvaro Sanchez");

  return (
    <nav className=" w-full bg-accent-light shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Left Section - Hamburger Menu */}
          <div className="flex items-center md:hidden">
           
          </div>

          {/* Center Section - Title (Always centered) */}
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
      
    </nav>
  );
};

export default Navbar;
