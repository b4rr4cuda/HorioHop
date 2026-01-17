/**
 * useResponsive.ts
 * 
 * Hook for detecting screen size and responsive breakpoints.
 * Uses media queries to determine if the device is mobile or desktop.
 * Used to conditionally render mobile vs desktop UI components.
 */

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useResponsive() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return { isMobile, isDesktop: !isMobile };
}
