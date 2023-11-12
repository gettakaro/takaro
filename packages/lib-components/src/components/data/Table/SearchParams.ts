import { useMemo } from 'react';

export const useTableSearchParamKeys = (tableId: string) => {
  return useMemo(() => {
    return {
      PAGE_INDEX: `table_${tableId}_page_index`,
      PAGE_SIZE: `table_${tableId}_page_size`,
      COLUMN_ORDER: `table_${tableId}_column_order`,
      // ... any additional dynamic keys
    };
  }, [tableId]);
};
