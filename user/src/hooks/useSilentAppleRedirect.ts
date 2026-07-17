'use client';

import { useEffect, useRef } from 'react';

const APPLE_CAPTIVE_URL = 'http://captive.apple.com/hotspot-detect.html';

function checkInternet(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `https://www.google.com/favicon.ico?rand=${Math.random()}`;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });
}

export function useSilentAppleRedirect(): void {
  const redirectedRef = useRef(false);

  useEffect(() => {
    const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
    const hasPending = sessionStorage.getItem('pendingCaptiveRedirect') === 'true';

    if (!isApple || !hasPending || redirectedRef.current) return;

    redirectedRef.current = true;

    const interval = setInterval(async () => {
      const hasInternet = await checkInternet();
      if (hasInternet) {
        clearInterval(interval);
        sessionStorage.removeItem('pendingCaptiveRedirect');
        window.location.href = APPLE_CAPTIVE_URL;
      }
    }, 2000);
  }, []);
}
