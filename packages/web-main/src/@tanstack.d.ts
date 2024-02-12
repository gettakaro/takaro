import '@tanstack/react-table';
import { router } from './App';

type DataTypes = 'datetime' | 'number' | 'string' | 'boolean' | 'uuid';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    hiddenColumn?: boolean;
    dataType?: DataTypes;
  }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
