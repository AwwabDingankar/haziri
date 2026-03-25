import { useMemo } from 'react';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function useDeviceFingerprint(): string {
  return useMemo(() => {
    const raw = [
      navigator.userAgent,
      `${screen.width}x${screen.height}`,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency ?? '',
      navigator.maxTouchPoints ?? '',
    ].join('|');
    return simpleHash(raw);
  }, []);
}
