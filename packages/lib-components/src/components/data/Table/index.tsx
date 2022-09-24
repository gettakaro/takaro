import React from 'react';
import { AgGridReact, AgGridColumnProps } from 'ag-grid-react';
import { FC } from 'react';
import { JsonArray} from 'type-fest';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface TableProps {
  columnDefs: Partial<AgGridColumnProps>[];
  rowData: any;
  width: string;
  height: string;
}

const caseInsensitiveComparator = (a: string, b: string) => {
  return a.toString().toLowerCase().localeCompare(b.toString().toLowerCase());
};

const defaultColumDef = {
  flex: 1,
  wrapText: true,
  autoHeight: true,
  resizable: true,
  sortable: true,
  cellStyle: { textAlign: 'left' },
  comparator: caseInsensitiveComparator,
};

export const Table: FC<TableProps> = ({ columnDefs, rowData, height, width }: TableProps) => {

  const finalColumnDefs = columnDefs.map((col) => {
    return {
      ...defaultColumDef,
      ...col,
    };
    });

  return (
    <div className="ag-theme-alpine" style={{ height, width }}>
      <AgGridReact rowData={rowData} columnDefs={finalColumnDefs}></AgGridReact>
    </div>
  );
};
