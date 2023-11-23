import { useMemo } from 'react';

export const useTableSearchParamKeys = (tableId: string) => {
  return useMemo(() => {
    return {
      PAGE_INDEX: `${tableId}PageIndex`,
      PAGE_SIZE: `${tableId}PageSize`,
      COLUMN_ORDER: `${tableId}ColumnOrder`,
      COLUMN_FILTER: `${tableId}ColumnFilter`,
      COLUMN_SEARCH: `${tableId}ColumnSearch`,
      COLUMN_SORT: `${tableId}ColumnSort`,
      COLUMN_VISIBILITY: `${tableId}ColumnVisibility`,
    };
  }, [tableId]);
};
