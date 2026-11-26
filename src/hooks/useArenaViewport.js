import { useLayoutEffect } from 'react';

export function useArenaViewport() {
  useLayoutEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;
    const original = viewport.content;
    viewport.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    return () => { viewport.content = original; };
  }, []);
}
