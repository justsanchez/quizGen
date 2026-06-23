import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { loginWithEmail, loginWithGoogle } from '../../firebase/auth';
import { getAdditionalUserInfo } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { ensureUserFolder } from '../../supabase/userFolder';

/**
 * Email/password + Google sign-in screen. Surfaces inline error messages
 * from Firebase, and redirects to `/` on success or if the user is already
 * authenticated.
 *
 * @component
 * @returns {JSX.Element|null}
 */
export default function Login() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSigningIn(true);
    setError('');
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
    setIsSigningIn(false);
  };

  const handleGoogleLogin = async () => {
    try {
      const credential = await loginWithGoogle();
      if (getAdditionalUserInfo(credential)?.isNewUser) {
        await ensureUserFolder(credential.user.uid);
      }
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  if (userLoggedIn) {
    navigate('/');
    return null;
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to continue to QuizGen</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-900/50 text-red-300 rounded-lg text-sm border border-red-800">
                {error}
              </div>
            )}

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition text-white"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition text-white"
                placeholder="••••••••"
                required
              />
              {/* ! Future feature ? Forgot password */}
              {/* <div className="flex justify-end mt-2">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div> */}
            </div>

            <button
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSigningIn ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : 'Sign In'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3  hover:bg-gray-700 border border-gray-700 py-3 rounded-lg transition-colors"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" 
                alt="Google Logo" 
                className="w-5 h-5"
              />
              <span className="font-medium text-white">Google</span>
            </button>

            <p className="text-center text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
                Sign up
              </Link>
            </p>
            {/* TODO: 5 free prompts for non logged in users -> Difficulty: Hard maybe */}
            {/* <p className="text-center text-gray-500 text-xs">
              <Link to="/" className="text-grey-100 hover:text-white-100 hover:underline">
                Continue without signing in?
              </Link>
            </p> */}
          </form>
        </div>
      </div>
    </div>
  );
}