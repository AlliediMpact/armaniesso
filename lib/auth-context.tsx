'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { getIdTokenResult, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { firebaseAuth, isFirebaseClientConfigured } from '@/lib/firebase-client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  roleSource: 'firebase-claim' | 'allow-list' | 'none';
  signOutUser: () => Promise<void>;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getAdminEmails(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return new Set(
    raw
      .split(',')
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseClaimAdmin, setFirebaseClaimAdmin] = useState(false);
  const adminEmails = useMemo(() => getAdminEmails(), []);

  useEffect(() => {
    if (!isFirebaseClientConfigured || !firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setFirebaseClaimAdmin(false);
        setLoading(false);
        return;
      }

      void getIdTokenResult(nextUser)
        .then((result) => {
          const claimAdmin =
            result.claims?.admin === true ||
            result.claims?.role === 'admin' ||
            (Array.isArray(result.claims?.roles) &&
              (result.claims.roles as unknown[]).includes('admin'));
          setFirebaseClaimAdmin(Boolean(claimAdmin));
        })
        .catch(() => setFirebaseClaimAdmin(false));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const emailAllowListAdmin = !!user?.email && adminEmails.has(user.email.toLowerCase());
  const isAdmin = firebaseClaimAdmin || emailAllowListAdmin;
  const roleSource = firebaseClaimAdmin ? 'firebase-claim' : emailAllowListAdmin ? 'allow-list' : 'none';

  const signOutUser = async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        roleSource,
        signOutUser,
        isConfigured: isFirebaseClientConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
