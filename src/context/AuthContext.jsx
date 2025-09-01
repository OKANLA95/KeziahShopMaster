// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';

// Create context
const AuthContext = createContext();

// Hook for accessing context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Firebase auth user
  const [userData, setUserData] = useState(null); // Firestore user document (role, shop, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.error('Firestore not initialized. Check your firebase.js');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user || null); // always set null if undefined

      if (user?.uid) {
        try {
          console.log('Fetching user data for UID:', user.uid);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData({ uid: user.uid, ...data }); // include uid
            console.log(`User role for UID ${user.uid}:`, data.role || 'No role set');
          } else {
            console.warn(`No user data found for UID: ${user.uid}`);
            setUserData({ uid: user.uid }); // minimal user object to avoid undefined errors
          }
        } catch (err) {
          if (err.code === 'permission-denied') {
            console.warn(
              `Permission denied fetching user data for UID: ${user.uid}. Check Firestore rules.`
            );
          } else {
            console.error('Error fetching user data:', err);
          }
          setUserData({ uid: user.uid });
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ===== Admin / Utility Functions =====

  // Reset a user’s password (Admin can call this by passing email)
  const resetUserPassword = async (email) => {
    if (!email) return false;
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  };

  // Update a user’s profile (name, photo)
  const updateUserProfile = async (updates) => {
    if (!auth.currentUser) {
      console.warn('No authenticated user to update profile');
      return false;
    }
    try {
      await updateProfile(auth.currentUser, updates);
      console.log('User profile updated:', updates);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  // Update Firestore user data (role, shop, etc.)
  const updateUserData = async (uid, updates) => {
    if (!uid) return false;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updates);
      console.log(`User ${uid} updated:`, updates);
      // Update local state if updating current user
      if (currentUser?.uid === uid) {
        setUserData(prev => ({ ...prev, ...updates }));
      }
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  };

  // ===== Provide context =====
  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        userData, 
        loading,
        resetUserPassword,
        updateUserProfile,
        updateUserData
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
