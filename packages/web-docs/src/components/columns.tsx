import React, { ReactNode, CSSProperties } from 'react';
// Import clsx library for conditional classes.
import clsx from 'clsx';
interface ColumnsProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Columns({ children, className, style }: ColumnsProps) {
  return (
    // This section encompasses the columns that we will integrate with children from a dedicated component to allow the addition of columns as needed
    <div className="container center">
      <div className={clsx('row', className)} style={style}>
        {children}
      </div>
    </div>
  );
}

interface ColumnProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Column({ children, className, style }: ColumnProps) {
  return (
    <div className={clsx('col', className)} style={style}>
      {children}
    </div>
  );
}
