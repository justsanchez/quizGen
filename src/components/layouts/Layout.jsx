import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Authenticated app shell. Renders the desktop Sidebar and mobile Header
 * around the routed page content, and acts as the auth guard for protected
 * routes by redirecting unauthenticated visitors to the landing page (`/`).
 *
 * @component
 * @returns {JSX.Element}
 */
const Layout = () => {
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();
    
    // if not logged in redirect to login page
    useEffect(() => {
        if (!userLoggedIn) {
            navigate('/');
        }
    }, [userLoggedIn]);
    
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Header />
      <Sidebar />
      
      <main className="flex-1 mt-16 md:ml-64 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;