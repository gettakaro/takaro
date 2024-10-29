import { useLayoutEffect } from 'react';

export function useLockBodyScroll(lock = true): void {
  useLayoutEffect(() => {
    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflowY;
      document.body.style.overflowY = 'hidden';
      // Re-enable scrolling when component unmounts.
      return (): void => {
        document.body.style.overflowY = originalStyle;
      };
    }
  }, []); // Empty array ensures effect is only run on mount and unmount.
}

export function useLockRefScroll(ref: React.MutableRefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      const originalStyle = element.style.overflow;
      element.style.overflow = 'hidden';
      return (): any => {
        element.style.overflow = originalStyle;
      };
    }
  }, [ref]);
}
