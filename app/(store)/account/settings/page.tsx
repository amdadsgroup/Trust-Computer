'use client';

import React, { useState } from 'react';
import { updateCustomerPasswordAction } from '../../auth/actions';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CustomerSettingsPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateCustomerPasswordAction({ password, confirmPassword });
      if (result.success) {
        setSuccessMessage(result.message || 'Password changed successfully.');
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(result.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Account Security & Password
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your account credentials and security preferences.
        </p>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 outline-none focus:border-[#0084d6] focus:bg-white transition"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 bg-[#0084d6] hover:bg-[#0074be] text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm transition shadow-md disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
        </button>
      </form>
    </div>
  );
}
