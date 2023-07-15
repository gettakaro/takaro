import { createContext, useContext } from 'react';
import { useTable } from './useTable';

type ContextType = ReturnType<typeof useTable>;

export const TableContext = createContext<ContextType | null>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);

  if (context == null) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};
