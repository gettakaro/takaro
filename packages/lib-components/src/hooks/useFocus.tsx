import { useRef } from 'react';

export const useFocus = () => {
  const htmlElRef = useRef<HTMLElement>(null);
  const setFocus = () => {
    if (htmlElRef.current) {
      htmlElRef.current.focus();
    }
  };

  return [htmlElRef, setFocus];
};
