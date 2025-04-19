import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    confirmPasswordReset,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    updateEmail,
    updatePassword
  } from 'firebase/auth';
  import { auth } from './config';
  
  const googleProvider = new GoogleAuthProvider();
  
  // Email/Password Auth
  export const registerWithEmail = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };
  
  export const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  // Google Auth
  export const loginWithGoogle = () => {
    return signInWithPopup(auth, googleProvider);
  };
  
  // Password Reset
  export const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };
  
  // Logout
  export const logout = () => {
    return signOut(auth);
  };
  
  // Update Email
  export const updateUserEmail = (email) => {
    return updateEmail(auth.currentUser, email);
  };
  
  // Update Password
  export const updateUserPassword = (password) => {
    return updatePassword(auth.currentUser, password);
  };