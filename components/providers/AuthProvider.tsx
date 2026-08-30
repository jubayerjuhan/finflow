'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useAppDispatch } from '@/store/hooks';
import { setAuthUser } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          dispatch(
            setAuthUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            })
          );
        } else {
          dispatch(setAuthUser(null));
        }
      });
      return unsubscribe;
    } catch (err) {
      console.error('Firebase auth is not configured yet:', err);
      dispatch(setAuthUser(null));
    }
  }, [dispatch]);

  return <>{children}</>;
}
