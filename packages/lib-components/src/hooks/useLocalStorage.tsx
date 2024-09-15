import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [error, setError] = useState<DOMException | null>(null);

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (e) {
      console.error('Error reading the local storage value', e);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prevValue: T) => T)): void => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (e) {
      // DOMException code 22 for QuotaExceededError
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded', e);
        setError(e);
      } else {
        console.error('Error setting the local storage value', e);
      }
    }
  };

  return { storedValue, setValue, error };
}
