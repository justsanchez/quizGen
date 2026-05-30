import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

/**
 * Subscribes to Firebase auth state and exposes it to the tree. Children are
 * not rendered until the initial auth resolution completes, so consumers can
 * trust `currentUser` immediately on mount instead of guarding for `loading`.
 *
 * Context shape:
 *   {
 *     currentUser:   import('firebase/auth').User | null,
 *     userLoggedIn:  boolean,
 *     loading:       boolean
 *   }
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userLoggedIn: !!currentUser,
    loading
  };  

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

/**
 * Hook accessor for the AuthContext value.
 * @returns {{ currentUser: import('firebase/auth').User | null, userLoggedIn: boolean, loading: boolean }}
 */
export function useAuth() {
  return useContext(AuthContext);
}