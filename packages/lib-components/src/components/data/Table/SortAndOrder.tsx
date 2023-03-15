import { Dropdown, Button, Checkbox } from '../../../components';
import { useDrag, useDrop } from 'react-dnd';
import { Identifier } from 'dnd-core';
import { ColumnOrderState, Column, OnChangeFn } from '@tanstack/react-table';
import { styled } from '../../../styled';
import { Control, useForm } from 'react-hook-form';

import {
  AiOutlineTable as OutlineTable,
  AiOutlineMenu as DragIcon,
} from 'react-icons/ai';
import { useCallback, useState } from 'react';

export const Container = styled.ul`
  &:last-child {
    margin-bottom: 0;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

interface SortAndOrderProps<DataType extends object> {
  columnOrder: ColumnOrderState;
  setColumnOrder: OnChangeFn<ColumnOrderState>;
  columns: Column<DataType>[];
}

interface Item {
  id: number;
  text: string;
}

// this is the logic that actually reorders the columns in the table
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

// dropRef is the reference to the drop target
// drag is the reference to the draggable item
export function SortAndOrder<DataType extends object>({
  columnOrder,
  setColumnOrder,
  columns,
}: SortAndOrderProps<DataType>) {
  const { control } = useForm();
  const [items, setItems] = useState<ColumnOrderState>(columnOrder);

  const moveItems = useCallback((dragIndex: number, hoverIndex: number) => {
    setItems((items) => {
      const dragItem = items[dragIndex];
      const newItems = [...items];
      newItems.splice(dragIndex, 1);
      newItems.splice(hoverIndex, 0, dragItem);
      return newItems;
    });
  }, []);

  /*
  const resetOrder = () =>
    setColumnOrder(columns.map((column) => column.id as string));
  */
  return (
    <Dropdown
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
              moveItems={moveItems}
              items={items}
            />
          ))}
        </Container>
      }
      renderReference={
        <Button icon={<OutlineTable />} text="Columns" color="background" />
      }
    />
  );
}

interface DragItem<DataType extends object> {
  column: Column<DataType>;
  columnOrder: ColumnOrderState;
  index: number;
  setColumnOrder: OnChangeFn<ColumnOrderState>;
  // TODO: not sure how to type this yet (probably just a boolean array?)
  control: Control<any>;
  moveItems: (dragIndex: number, hoverIndex: number) => void;
  items: ColumnOrderState;
}

export function Item<DataType extends object>({
  column,
  columnOrder,
  setColumnOrder,
  control,
  index,
  moveItems,
}: DragItem<DataType>) {
  const [{ handlerId }, dropRef] = useDrop<
    DragItem<DataType>,
    void,
    { handlerId: Identifier | null }
  >({
    // accept is the type of item that can be dropped
    accept: 'column',
    collect: (monitor) => {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover: (item) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      moveItems(dragIndex, hoverIndex);
      // TODO: move items in the list of columns (not table)
    },
    // called when the item is dropped
    drop: (draggedColumn) => {
      console.log(draggedColumn);
      // get vertical middle
      const newColumnOrder = reorderColumn(
        draggedColumn.column.id,
        column.id,
        columnOrder
      );
      setColumnOrder(newColumnOrder);
    },
  });

  const [, dragRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: { type: 'column', column, columnOrder, index, setColumnOrder },
    type: 'column',
  });

  return (
    <li ref={dropRef}>
      <Checkbox
        key={`column-visibility-checkbox-${column.id}`}
        name={`column-visiblity-${column.id}`}
        value={column.getIsVisible()}
        control={control}
        labelPosition="right"
        label={column.id}
        onChange={(visible) => {
          column.toggleVisibility(visible);
        }}
      />
      <div ref={dragRef} data-handler-id={handlerId}>
        <DragIcon data-handler-id />
      </div>
    </li>
  );
}
