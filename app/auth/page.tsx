'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase-client';
import { useAuth } from '@/lib/auth-context';

export default function AuthPage() {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => searchParams?.get('next') || '/account', [searchParams]);

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, router, nextPath]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!firebaseAuth) {
      setError('Firebase Auth is not configured.');
      return;
    }

    setPending(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        router.replace(nextPath);
      } else if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() }).catch(() => null);
        }
        const token = await cred.user.getIdToken().catch(() => '');
        if (token) {
          await fetch('/api/account/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ fullName: fullName.trim() }),
          }).catch(() => null);
        }
        router.replace(nextPath);
      } else {
        await sendPasswordResetEmail(firebaseAuth, email);
        setMessage('Password reset email sent. Please check your inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 mb-6">
            {mode === 'forgot'
              ? 'Enter your email to receive a password reset link.'
              : 'Sign in to track orders and access your customer dashboard.'}
          </p>

          {!isConfigured && (
            <div className="mb-4 rounded-lg border border-orange/40 bg-orange/10 p-3 text-sm text-orange-light">
              Firebase client keys are missing. Add them in `.env.local` with `NEXT_PUBLIC_FIREBASE_*`.
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                  placeholder="********"
                />
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && <p className="text-sm text-green-400">{message}</p>}

            <button
              type="submit"
              disabled={pending || !isConfigured}
              className="w-full rounded-lg bg-orange text-dark-bg font-semibold px-4 py-2 disabled:opacity-50"
            >
              {pending
                ? 'Please wait...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-400">
            {mode === 'signin' ? 'No account yet?' : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-orange hover:text-orange-light"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            <button
              type="button"
              onClick={() => setMode('forgot')}
              className="text-orange hover:text-orange-light"
            >
              Forgot password?
            </button>
          </div>

          <Link href="/store" className="inline-block mt-5 text-sm text-gray-400 hover:text-white">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
