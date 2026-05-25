'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase-client';
import { useAuth } from '@/lib/auth-context';

type Mode = 'signin' | 'signup' | 'forgot';

function normalizePhoneNumber(value: string) {
  const cleaned = value.trim().replace(/[\s()\-]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith('0') && cleaned.length >= 10) return `+27${cleaned.slice(1)}`;
  return cleaned;
}

function getPasswordRequirements(password: string) {
  return [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'One uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'One number', passed: /\d/.test(password) },
    { label: 'One symbol', passed: /[^A-Za-z0-9]/.test(password) },
  ];
}

function mapAuthError(error: any) {
  const code = String(error?.code || '').toLowerCase();
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or reset your password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Use a stronger password with 8+ characters, a number, and a symbol.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No account was found for that email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return error?.message || 'Authentication failed.';
  }
}

export default function AuthPage() {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = useMemo(() => searchParams?.get('next') || '/account', [searchParams]);

  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const emailNotVerified = Boolean(user && !user.emailVerified);

  useEffect(() => {
    if (!loading && user && user.emailVerified) {
      router.replace(nextPath);
    }
  }, [loading, user, router, nextPath]);

  useEffect(() => {
    if (emailNotVerified) {
      setMode('signin');
      setMessage('Your account is signed in, but the email address still needs to be verified before continuing.');
    }
  }, [emailNotVerified]);

  const applyAuthPersistence = async () => {
    if (!firebaseAuth) return;
    await setPersistence(firebaseAuth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
  };

  const resendVerificationEmail = async () => {
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    setError('');
    setMessage('');
    setResendingVerification(true);
    try {
      await sendEmailVerification(firebaseAuth.currentUser, {
        url: `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`,
        handleCodeInApp: true,
      });
      setMessage('Verification email sent again. Check your inbox and spam folder, then click “I’ve verified my email”.');
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setResendingVerification(false);
    }
  };

  const confirmVerification = async () => {
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    setError('');
    setMessage('');
    try {
      await firebaseAuth.currentUser.reload();
      const refreshedUser = firebaseAuth.currentUser;
      if (refreshedUser?.emailVerified) {
        router.replace(nextPath);
        return;
      }
      setError('Your email is still not verified yet. Check your inbox, spam folder, then try again.');
    } catch (err: any) {
      setError(mapAuthError(err));
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!firebaseAuth) {
      setError('Firebase Auth is not configured.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!phone.trim()) {
        setError('Please enter your phone number.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('Please accept the terms and conditions to continue.');
        return;
      }
    }

    setPending(true);
    try {
      await applyAuthPersistence();

      if (mode === 'signin') {
        const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user, {
            url: `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`,
            handleCodeInApp: true,
          }).catch(() => null);
          setMessage('Please verify your email before continuing. We sent a fresh verification link to your inbox.');
          setMode('signin');
          return;
        }
        router.replace(nextPath);
      } else if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const normalizedPhone = normalizePhoneNumber(phone);

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
            body: JSON.stringify({
              fullName: fullName.trim(),
              phone: normalizedPhone,
            }),
          }).catch(() => null);
        }

        await sendEmailVerification(cred.user, {
          url: `${window.location.origin}/auth?next=${encodeURIComponent(nextPath)}`,
          handleCodeInApp: true,
        }).catch(() => null);

        setMessage(`Account created. A verification email was sent to ${email}. Please verify it before continuing.`);
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setAgreeTerms(false);
      } else {
        await sendPasswordResetEmail(firebaseAuth, email);
        setMessage('Password reset email sent. Please check your inbox.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(mapAuthError(err));
    } finally {
      setPending(false);
    }
  };

  const passwordRequirements = getPasswordRequirements(password);
  const passwordStrengthScore = passwordRequirements.filter((item) => item.passed).length;

  return (
    <div className="min-h-screen bg-gradient-dark pt-28 pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400 mb-6">
            {mode === 'forgot'
              ? 'Enter your email to receive a password reset link.'
              : mode === 'signup'
              ? 'Create your customer account to track orders and save your details.'
              : 'Sign in to track orders and access your customer dashboard.'}
          </p>

          {!isConfigured && (
            <div className="mb-4 rounded-lg border border-orange/40 bg-orange/10 p-3 text-sm text-orange-light">
              Firebase client keys are missing. Add them in `.env.local` with `NEXT_PUBLIC_FIREBASE_*`.
            </div>
          )}

          {emailNotVerified && user && (
            <div className="mb-4 rounded-xl border border-orange/40 bg-orange/10 p-4 text-sm text-orange-light">
              <p className="font-semibold mb-2">Email verification required</p>
              <p className="text-gray-200 mb-4">
                We have blocked access until your email address is verified. Check your inbox, spam, or resend the verification email.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={resendVerificationEmail}
                  disabled={resendingVerification}
                  className="rounded-lg border border-orange px-4 py-2 text-sm font-semibold text-orange transition hover:bg-orange/10 disabled:opacity-50"
                >
                  {resendingVerification ? 'Sending...' : 'Resend verification email'}
                </button>
                <button
                  type="button"
                  onClick={confirmVerification}
                  className="rounded-lg bg-orange px-4 py-2 text-sm font-semibold text-dark-bg transition hover:bg-orange-light"
                >
                  I’ve verified my email
                </button>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    pattern="[0-9+\-\s()]{10,}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="Your phone number (e.g. +27 61 543 6379)"
                    title="Please enter a valid phone number"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                placeholder="you@example.com"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password</label>
                <div className="flex gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    minLength={mode === 'signup' ? 8 : 6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="shrink-0 rounded-lg border border-dark-border bg-dark-card px-3 py-2 text-sm text-gray-300 transition hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="mt-3 rounded-lg border border-dark-border bg-dark-bg/60 p-3 text-xs text-gray-400">
                    <p className="mb-2 font-semibold text-gray-300">Password requirements</p>
                    <div className="space-y-1">
                      {passwordRequirements.map((item) => (
                        <p key={item.label} className={item.passed ? 'text-green-400' : 'text-gray-400'}>
                          {item.passed ? '✓' : '•'} {item.label}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-gray-500">Strength: {passwordStrengthScore}/4</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-dark-border bg-dark-bg text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange"
                  placeholder="Re-enter your password"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border border-dark-border bg-dark-bg"
                />
                Keep me signed in on this device
              </label>
            )}

            {mode === 'signup' && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 rounded border border-dark-border bg-dark-bg"
                />
                <label htmlFor="terms" className="text-sm text-gray-400">
                  I agree to the terms and conditions and privacy policy
                </label>
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
              onClick={() => {
                setError('');
                setMessage('');
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }}
              className="text-orange hover:text-orange-light"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-400">
            <button
              type="button"
              onClick={() => {
                setError('');
                setMessage('');
                setMode('forgot');
              }}
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
