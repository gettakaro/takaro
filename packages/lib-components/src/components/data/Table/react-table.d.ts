// IMPORTANT: this needs to be mirrored in web-main/src/react-table.d.ts
import '@tanstack/react-table';

type DataTypes = 'datetime' | 'number' | 'string' | 'boolean' | 'uuid';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /// Column is not visible in table by default, but can be enabled with view options
    hideColumn?: boolean;
    canShowColumn?: boolean;
    includeColumn?: boolean;
    dataType?: DataTypes;
  }
}
