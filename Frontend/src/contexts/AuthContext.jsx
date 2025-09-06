import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const { displayName, email, photoURL } = user;
      const createdAt = serverTimestamp();
      
      try {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: displayName || additionalData.displayName || '',
          email,
          photoURL: photoURL || '',
          createdAt,
          lastLoginAt: serverTimestamp(),
          profileCompleted: false,
          assessmentCompleted: false,
          ...additionalData
        });
        
        console.log('User document created successfully');
      } catch (error) {
        console.error('Error creating user document:', error);
        throw error;
      }
    } else {
      // Update last login time for existing users
      try {
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error updating last login:', error);
      }
    }
  };

  // Sign up with email and password
  const signUp = async (email, password, displayName) => {
    setAuthLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      // Create user document in Firestore
      await createUserDocument(result.user, { displayName });
      
      toast.success('Account created successfully!');
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email is already registered';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    setAuthLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      toast.success('Signed in successfully!');
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserDocument(result.user);
      toast.success('Signed in with Google successfully!');
      return result;
    } catch (error) {
      console.error('Google sign in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup blocked. Please allow popups and try again';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully!');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        try {
          await createUserDocument(user);
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    user: currentUser, // Alias for backward compatibility
    loading,
    authLoading,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    logout,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
