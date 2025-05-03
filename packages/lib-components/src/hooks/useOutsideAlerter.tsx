import { useEffect, RefObject } from 'react';

export function useOutsideAlerter<T extends HTMLElement>(ref: RefObject<T | null>, f: () => void): void {
  useEffect(() => {
    function handleClickOutside(event: any): void {
      if (ref.current && !ref.current.contains(event.target)) {
        f();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, f]);
}
