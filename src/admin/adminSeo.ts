import { useEffect } from 'react';

/**
 * Ensures <meta name="robots" content="noindex, nofollow" /> is active
 * on all admin routes, and cleanly cleans up when navigating back to the public site.
 */
export function syncAdminRobotsMeta(isAdminRoute: boolean = true): void {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (isAdminRoute) {
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
  } else {
    if (meta) {
      meta.remove();
    }
  }
}

/**
 * Hook to enforce SEO noindex, nofollow while inside admin pages.
 */
export function useAdminSeo(): void {
  useEffect(() => {
    syncAdminRobotsMeta(true);
    return () => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        syncAdminRobotsMeta(false);
      }
    };
  }, []);
}
