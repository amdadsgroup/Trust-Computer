'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // When pathname or searchParams change, complete the progress bar
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to trigger the progress bar immediately
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, hash, javascript:, download, or new-tab links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // If clicking same path and query, ignore
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const currentUrl = new URL(window.location.href);
        if (url.pathname === currentUrl.pathname && url.search === currentUrl.search) {
          return;
        }

        // Start progress
        setVisible(true);
        setProgress(15);

        // Progress increments
        const t1 = setTimeout(() => setProgress(45), 80);
        const t2 = setTimeout(() => setProgress(75), 250);
        const t3 = setTimeout(() => setProgress(90), 500);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } catch {
        // Safe fallback
      }
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-200"
      style={{ opacity: progress === 100 ? 0 : 1 }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-[#2A3B97] via-[#0084d6] to-[#00d2ff] shadow-[0_0_10px_#0084d6]"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? 'width 150ms ease-out' : 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
