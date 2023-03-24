import { useRef, useState } from 'react';
import { Dropdown, Button, Checkbox } from '../../../../components';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { Identifier } from 'dnd-core';
import { ColumnOrderState, Column, OnChangeFn } from '@tanstack/react-table';
import { styled } from '../../../../styled';
import { Control, FieldValues, useForm } from 'react-hook-form';

import {
  AiOutlineTable as OutlineTable,
  AiOutlineMenu as DragIcon,
} from 'react-icons/ai';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const Container = styled.ul`
  padding: ${({ theme }) => theme.spacing['2_5']};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing['1_5']};

    &:last-child {
      margin-bottom: 0;
    }

    & > div > svg {
      margin-left: ${({ theme }) => theme.spacing['2_5']};
    }
  }
`;

interface ColumnControllerProps<DataType extends object> {
  columnOrder: ColumnOrderState;
  setColumnOrder: OnChangeFn<ColumnOrderState>;
  columns: Column<DataType>[];
}

export function ColumnController<DataType extends object>({
  columnOrder,
  setColumnOrder,
  columns,
}: ColumnControllerProps<DataType>) {
  const { control } = useForm();
  const [openVisibleOrderMenu, setOpenVisibleOrderMenu] =
    useState<boolean>(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <Dropdown
        open={openVisibleOrderMenu}
        setOpen={setOpenVisibleOrderMenu}
        renderFloating={
          <Container>
            {columns.map((column, index) => (
              <Item
                key={column.id}
                column={column}
                index={index}
                control={control}
                setColumnOrder={setColumnOrder}
                columnOrder={columnOrder}
              />
            ))}
          </Container>
        }
        renderReference={
          <Button icon={<OutlineTable />} text="Columns" color="background" />
        }
      />
    </DndProvider>
  );
}

interface DragItem<DataType extends object> {
  column: Column<DataType>;
  columnOrder: ColumnOrderState;
  index: number;
  setColumnOrder: OnChangeFn<ColumnOrderState>;
  control: Control<FieldValues>;
}

const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[]
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
  );
  return [...columnOrder];
};

export function Item<DataType extends object>({
  column,
  columnOrder,
  setColumnOrder,
  control,
  index,
}: DragItem<DataType>) {
  const dropRef = useRef<HTMLLIElement>(null);

  const [{ handlerId }, drop] = useDrop<
    DragItem<DataType>,
    void,
    { handlerId: Identifier | null }
  >({
    accept: 'column',
    collect: (monitor) => ({ handlerId: monitor.getHandlerId() }),
    hover: (draggedColumn, monitor) => {
      if (draggedColumn.index === index || !dropRef.current) {
        return;
      }

      const hBoundingRect = dropRef.current.getBoundingClientRect();
      const hMiddleY = (hBoundingRect.bottom - hBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (clientOffset == null) return;
      const hClientY = clientOffset.y - hBoundingRect.top;

      if (
        (draggedColumn.index < index && hClientY < hMiddleY) ||
        (draggedColumn.index > index && hClientY > hMiddleY)
      )
        return;

      setColumnOrder(
        reorderColumn(draggedColumn.column.id, column.id, columnOrder)
      );
    },
    drop: (draggedColumn) => {
      setColumnOrder(
        reorderColumn(draggedColumn.column.id, column.id, columnOrder)
      );
    },
  });

  const [, dragRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: { type: 'column', column, columnOrder, index, setColumnOrder },
    type: 'column',
  });

  drop(dropRef);

  const labelText = () => {
    const text = column.id;
    const res = text.replace(/([A-Z])/g, ' $1');
    const finalResult = res.charAt(0).toUpperCase() + res.slice(1);
    return finalResult;
  };

  return (
    <li ref={dropRef}>
      <Checkbox
        key={`column-visibility-checkbox-${column.id}`}
        name={`column-visiblity-${column.id}`}
        value={column.getIsVisible()}
        control={control}
        labelPosition="right"
        label={labelText()}
        onChange={(visible) => {
          column.toggleVisibility(visible);
        }}
      />
      <div ref={dragRef} data-handler-id={handlerId}>
        <DragIcon style={{ cursor: 'pointer' }} />
      </div>
    </li>
  );
}
