import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithEmail, loginWithGoogle, logout } from '../../firebase/auth'; // Import logout
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { userLoggedIn, currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Redirect after logout
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    try {
      await loginWithEmail(email, password);
    } catch (error) {
      setError(error.message);
    }
    setIsSigningIn(false);
  };

  return (
    <div className="text-white">
      {userLoggedIn ? (
        <div className="flex flex-col items-center gap-4">
          {/* Profile Section */}
          <div className="text-center">
            {currentUser?.photoURL && (
            <img
            src={currentUser?.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(currentUser?.displayName || "U") + "&background=random"}
            alt="Profile"
            className="w-16 h-16 rounded-full mx-auto mb-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || "U")}&background=random`;
            }}
          />
            )}
            <h2 className="text-xl font-semibold">
              Welcome, {currentUser?.displayName || currentUser?.email}
            </h2>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Log Out
          </button>
          
          {error && <p className="text-red-400">{error}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          {/* Existing form elements */}
          {error && <p className="text-red-400">{error}</p>}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 rounded text-black"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 rounded text-black"
          />
          <button 
            type="submit" 
            disabled={isSigningIn}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </button>
          <button 
            type="button" 
            onClick={loginWithGoogle}
            className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              {/* Google SVG */}
            </svg>
            Continue with Google
          </button>
        </form>
      )}
    </div>
  );
}