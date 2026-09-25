'use client';

import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title?: string; message: string; type?: ToastType; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    ({
      title,
      message,
      type = 'info',
      duration = 4000,
    }: {
      title?: string;
      message: string;
      type?: ToastType;
      duration?: number;
    }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = React.useCallback(
    (message: string, title = 'Success') => toast({ title, message, type: 'success' }),
    [toast]
  );
  const error = React.useCallback(
    (message: string, title = 'Error') => toast({ title, message, type: 'error' }),
    [toast]
  );
  const info = React.useCallback(
    (message: string, title = 'Information') => toast({ title, message, type: 'info' }),
    [toast]
  );
  const warning = React.useCallback(
    (message: string, title = 'Notice') => toast({ title, message, type: 'warning' }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5',
              item.type === 'success' && 'bg-emerald-950/90 text-white border-emerald-800 shadow-emerald-900/30',
              item.type === 'error' && 'bg-rose-950/90 text-white border-rose-800 shadow-rose-900/30',
              item.type === 'warning' && 'bg-amber-950/90 text-white border-amber-800 shadow-amber-900/30',
              item.type === 'info' && 'bg-slate-900/90 text-white border-slate-700 shadow-slate-950/40'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {item.title && <p className="text-sm font-semibold tracking-wide leading-tight">{item.title}</p>}
              <p className="text-xs text-slate-200 mt-0.5 leading-snug break-words">{item.message}</p>
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 -mr-1 -mt-1 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
