'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { requestPasswordResetAction } from '../auth/actions';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [directResetUrl, setDirectResetUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setDirectResetUrl(null);
    setIsLoading(true);

    try {
      const result = await requestPasswordResetAction({ email });
      if (result.success) {
        setSuccessMessage(result.message || 'Password reset instructions have been processed.');
        if (result.directResetUrl) {
          setDirectResetUrl(result.directResetUrl);
        }
      } else {
        setErrorMessage(result.error || 'Failed to submit password reset request.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Header */}
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
            - Your Trust, Our Technology -
          </p>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mb-1">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your registered account email to receive a secure password reset link.
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl space-y-4 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-sm text-emerald-900">Reset Request Processed!</p>
                <p className="text-emerald-700 mt-1">{successMessage}</p>
                {!directResetUrl && (
                  <p className="text-emerald-600 text-[11px] mt-1.5">
                    Please check your inbox (and spam or junk folder). The reset link is valid for 60 minutes.
                  </p>
                )}
              </div>
            </div>

            {/* Direct Reset Button */}
            {directResetUrl && (
              <div className="pt-3 border-t border-emerald-200 space-y-2">
                <p className="text-[11px] font-semibold text-emerald-800">
                  Click the button below to choose your new password right now:
                </p>
                <a
                  href={directResetUrl}
                  className="w-full flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md"
                >
                  <span>Set New Password Now</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Registered Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-[#2A3B97] focus:bg-white transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Sending Instructions...</span>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Remembered your password?</span>
            <Link href="/login" className="font-bold text-[#0084d6] hover:underline">
              Sign In
            </Link>
          </div>
        </form>

        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted token authentication & secure verification</span>
        </div>
      </div>
    </div>
  );
}
