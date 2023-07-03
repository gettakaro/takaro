import { useState, useEffect } from 'react';

export function useOnScreen(ref: React.RefObject<any>, rootMargin = '0px'): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return (): void => {
      observer.unobserve(ref.current);
    };
  }, []);

  return isIntersecting;
}
