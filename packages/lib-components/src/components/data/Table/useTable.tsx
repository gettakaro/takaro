import { useRef, useState } from 'react';

export function useTable() {
  const [searchAndFilterInputValue, setSearchAndFilterInputValue] = useState<string>('');
  const SearchAndFilterInputRef = useRef<HTMLInputElement>(null);

  return {
    searchAndFilterInputValue,
    setSearchAndFilterInputValue,
    SearchAndFilterInputRef,
  };
}
