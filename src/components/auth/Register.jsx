import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registerWithEmail, loginWithGoogle } from '../../firebase/auth';

/**
 * New-account screen. Validates that password and confirmation match before
 * calling Firebase, and offers a Google sign-up alternative. Redirects to
 * `/` on success or if the user is already authenticated.
 *
 * @component
 * @returns {JSX.Element|null}
 */
export default function Register() {
  const { userLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    setError('');
    
    try {
      await registerWithEmail(email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
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
    <div className="w-screen min-h-screen flex flex-col bg-gray-900 text-gray-100 md:flex-row">
      {/* Side Call-to-Action Panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold text-white mb-6">Welcome to QuizGen!</h2>
          <p className="text-xl text-blue-200 mb-8">
            Create amazing quizzes, track progress, and share your knowledge with the community.
          </p>
         

        </div>
      </div>

      {/* Registration Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join our community of quiz creators</p>
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
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition text-white"
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
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition text-white"
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-medium">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition text-white"
                placeholder="••••••••"
                minLength="6"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Sign Up'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 py-3 rounded-lg transition-colors"
            >
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" 
                alt="Google Logo" 
                className="w-5 h-5"
              />
              <span className="font-medium text-white">Google</span>
            </button>

            <p className="text-center text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
                Sign in
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