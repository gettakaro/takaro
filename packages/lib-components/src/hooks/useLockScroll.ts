import { useLayoutEffect } from 'react';

export function useLockBodyScroll(lock = true): void {
  useLayoutEffect(() => {
    if (lock) {
      const original_overflow_value = window.getComputedStyle(document.body).overflowY;
      document.body.style.setProperty('overflowY', 'hidden');
      // Re-enable scrolling when component unmounts.
      return (): void => {
        document.body.style.setProperty('overflowY', original_overflow_value);
      };
    }
  }, []); // Empty array ensures effect is only run on mount and unmount.
}

export function useLockRefScroll(ref: React.MutableRefObject<HTMLElement>): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (element) {
      const original_overflow_value = element.style.overflow;
      element.style.setProperty('overflow', 'hidden');
      return (): any => {
        element.style.setProperty('overflow', original_overflow_value);
      };
    }
  }, [ref]);
}
