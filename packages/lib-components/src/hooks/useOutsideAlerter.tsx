import { useEffect, RefObject } from 'react';

export function useOutsideAlerter(ref: RefObject<HTMLElement>, f: () => void): void {
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
  }, [ref]);
}
