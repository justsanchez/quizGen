/**
 * Thin wrappers around Firebase Auth methods, bound to the configured `auth`
 * instance from ./config. Each function returns the underlying Firebase
 * promise; callers handle resolution and errors.
 */
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateEmail,
    updatePassword,
    deleteUser,
  } from 'firebase/auth';
  import { auth } from './config';

  const googleProvider = new GoogleAuthProvider();

  /**
   * Create a new Firebase user with an email + password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('firebase/auth').UserCredential>}
   */
  export const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign in an existing Firebase user with email + password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import('firebase/auth').UserCredential>}
   */
  export const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Sign in via the Google OAuth popup.
   * @returns {Promise<import('firebase/auth').UserCredential>}
   */
  export const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };

  /**
   * Send a password-reset email to the given address.
   * @param {string} email
   * @returns {Promise<void>}
   */
  export const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  /**
   * Sign the current user out.
   * @returns {Promise<void>}
   */
  export const logout = () => {
    return signOut(auth);
  };

  /**
   * Update the currently-authenticated user's email address.
   * Requires recent re-authentication; Firebase will throw otherwise.
   * @param {string} email
   * @returns {Promise<void>}
   */
  export const updateUserEmail = (email) => {
    return updateEmail(auth.currentUser, email);
  };

  /**
   * Update the currently-authenticated user's password.
   * Requires recent re-authentication; Firebase will throw otherwise.
   * @param {string} password
   * @returns {Promise<void>}
   */
  export const updateUserPassword = (password) => {
    return updatePassword(auth.currentUser, password);
  };

  /**
   * Permanently delete the currently-authenticated Firebase user.
   * Firebase may throw `auth/requires-recent-login` if the session is stale;
   * callers should catch that and prompt the user to re-authenticate.
   * @returns {Promise<void>}
   */
  export const deleteCurrentUser = () => {
    return deleteUser(auth.currentUser);
  };