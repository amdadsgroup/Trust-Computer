'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900">Application Error</h1>
          <p className="text-xs text-slate-500">
            An unexpected error occurred while processing your request.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-50 transition"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
