import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, firebaseReady } from '../lib/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(() => localStorage.getItem('guest-mode') === '1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return undefined;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setGuest(false);
        localStorage.removeItem('guest-mode');
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      guest,
      loading,
      startGuest: () => {
        setGuest(true);
        setUser(null);
        localStorage.setItem('guest-mode', '1');
      },
      login: (email, password) =>
        firebaseReady
          ? signInWithEmailAndPassword(auth, email, password)
          : Promise.reject(new Error('Firebase yapılandırılmamış (.env doldurulmalı).')),
      register: (email, password) =>
        firebaseReady
          ? createUserWithEmailAndPassword(auth, email, password)
          : Promise.reject(new Error('Firebase yapılandırılmamış (.env doldurulmalı).')),
      logout: async () => {
        if (firebaseReady) {
          await signOut(auth);
        }
        setGuest(false);
        localStorage.removeItem('guest-mode');
      },
    }),
    [user, guest, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
