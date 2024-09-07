// IMPORTANT: this needs to be mirrored in lib-components/components/data/table/react-table.d.ts
import '@tanstack/react-table';

type DataTypes = 'datetime' | 'number' | 'string' | 'boolean' | 'uuid';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /// Column is not visible in table by default, but can be enabled with view options
    hideColumn?: boolean;
    includeColumn?: boolean;
    dataType?: DataTypes;
  }
}
