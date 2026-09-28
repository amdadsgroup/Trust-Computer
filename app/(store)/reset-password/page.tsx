'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateCustomerPasswordAction, verifyResetTokenAction } from '../auth/actions';
import {
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name?: string; email?: string } | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    let isMounted = true;

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setIsVerifying(false);
          setTokenValid(false);
          setTokenError('No password reset token was found in the link. Please request a new reset link.');
        }
        return;
      }

      try {
        const result = await verifyResetTokenAction(token);
        if (isMounted) {
          setIsVerifying(false);
          if (result.valid) {
            setTokenValid(true);
            setUserInfo({ name: result.name, email: result.email });
          } else {
            setTokenValid(false);
            setTokenError(result.error || 'This password reset link is invalid or has expired.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setIsVerifying(false);
          setTokenValid(false);
          setTokenError('Unable to verify the reset token. Please request a new link.');
        }
      }
    }

    checkToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCustomerPasswordAction({
        token,
        password,
        confirmPassword,
      });

      if (result.success) {
        setSuccessMessage(result.message || 'Password has been updated successfully!');
        setTimeout(() => {
          router.push('/login');
        }, 2500);
      } else {
        setErrorMessage(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isLengthValid = password.length >= 6;
  const isMatchValid = password.length > 0 && password === confirmPassword;

  // 1. Loading State while verifying token
  if (isVerifying) {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A3B97] mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Verifying Security Link...</h2>
        <p className="text-xs text-slate-500">
          Please wait while we validate your one-time password reset link.
        </p>
      </div>
    );
  }

  // 2. Invalid or Expired Token State
  if (!tokenValid) {
    return (
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Invalid or Expired Link
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {tokenError || 'This password reset link has expired or has already been used.'}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-700">Why might this happen?</p>
          <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px]">
            <li>Password reset links expire 60 minutes after being issued.</li>
            <li>The link has already been used to set a new password.</li>
            <li>A newer password reset request was submitted.</li>
          </ul>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            href="/forgot-password"
            className="w-full flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Request a New Reset Link</span>
          </Link>

          <Link
            href="/login"
            className="block text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  // 3. Valid Token: Show Set New Password Form
  return (
    <div className="max-w-md w-full space-y-6">
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block py-1">
          <Image
            src="/brand/trust-computer-logo.png"
            alt="Trust Computer-Moulvibazar"
            width={220}
            height={46}
            priority
            className="h-11 w-auto mx-auto object-contain"
          />
        </Link>
        <p className="text-[11px] font-bold text-[#2A3B97] uppercase tracking-wider">
          Your Trust, Our Technology
        </p>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mb-1">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {userInfo?.name ? `Welcome, ${userInfo.name}. ` : ''}Please choose a strong new password for your account.
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">{successMessage}</p>
            <p className="text-[11px] text-emerald-700">Redirecting to login page in a few moments...</p>
            <Link
              href="/login"
              className="inline-block font-bold text-[#2A3B97] underline text-xs mt-1"
            >
              Click here to sign in now
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!successMessage && (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-[#2A3B97] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-[#2A3B97] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Validation Checklist */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isLengthValid ? 'bg-emerald-500' : 'bg-slate-300'}`}
              />
              <span className={isLengthValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                At least 6 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isMatchValid ? 'bg-emerald-500' : 'bg-slate-300'}`}
              />
              <span className={isMatchValid ? 'text-emerald-700 font-semibold' : 'text-slate-500'}>
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !isLengthValid || !isMatchValid}
            className="w-full flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <Link href="/login" className="font-bold text-[#0084d6] hover:underline">
              Cancel & Return to Login
            </Link>
          </div>
        </form>
      )}

      <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Protected with secure bcrypt encryption</span>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#2A3B97] mx-auto" />
            <p className="text-xs text-slate-400 mt-2">Loading reset page...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
