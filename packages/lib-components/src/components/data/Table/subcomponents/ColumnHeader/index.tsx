import { Column, ColumnOrderState, Header, Table, flexRender } from '@tanstack/react-table';
import { useDrag, useDragLayer, useDrop, XYCoord } from 'react-dnd';
import { ColumnSettings } from './ColumnSettings';
import { Identifier } from 'dnd-core';
import { styled } from '../../../../../styled';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Target, Content, Th, ResizeHandle, InnerTh } from './style';

const ItemTypes = {
  COLUMN: 'column',
};

interface CollectedProps {
  handlerId: Identifier | null;
  isActive: boolean;
  isRight: boolean;
}

export interface ColumnHeaderProps<DataType extends object> {
  header: Header<DataType, unknown>;
  table: Table<DataType>;
  isLoading: boolean;
}

const reorder = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
  );
  return [...columnOrder];
};

export function ColumnHeader<DataType extends object>({ header, table, isLoading }: ColumnHeaderProps<DataType>) {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const canDrag = !isLoading;

  const [{ isActive, isRight }, dropRef] = useDrop<Column<DataType>, void, CollectedProps>({
    accept: ItemTypes.COLUMN,
    collect: (monitor) => ({
      isActive: monitor.canDrop() && monitor.isOver(),
      // check if the dragged element is situated on the right or left of the current element
      isRight: columnOrder.indexOf(column.id) > columnOrder.indexOf(monitor.getItem()?.id),
      handlerId: monitor.getHandlerId(),
    }),
    drop: (draggedColumn: Column<DataType>) => {
      const newColumnOrder = reorder(draggedColumn.id, column.id, columnOrder);
      setColumnOrder(newColumnOrder);
    },
    canDrop: (draggedColumn: Column<DataType>) => draggedColumn.id !== column.id,
    hover: (draggedColumn: Column<DataType>, monitor) => {
      if (!ref.current) {
        return;
      }
      const hoverIndex = columnOrder.indexOf(column.id);
      const draggedIndex = columnOrder.indexOf(draggedColumn.id);

      // Don't replace items with themselves
      if (draggedIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

      // Determine mouse position
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const clientOffset = monitor.getClientOffset()!;

      // Get pixels to the top
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      // Dragging left
      if (draggedIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }

      // Dragging right
      if (draggedIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      // Time to actually perform the action
      const newColumnOrder = reorder(draggedColumn.id, column.id, columnOrder);
      setColumnOrder(newColumnOrder);
    },
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({
      ...column,
      draggedIndex: columnOrder.indexOf(column.id),
    }),

    // Disable dragging whnen loading
    canDrag: !isLoading,
    type: ItemTypes.COLUMN,
  });

  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      dragRef(node);
      dropRef(node);
    }
  }, [dragRef, dropRef]);

  return (
    <Th
      canDrag={canDrag}
      colSpan={header.colSpan}
      scope="col"
      isDragging={isDragging}
      isActive={isActive}
      isRight={isRight}
      width={header.getSize()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isRowSelection={false}
    >
      <InnerTh>
        <Target ref={ref} isDragging={isDragging} role="DraggableBox" draggable={true}>
          <CustomDragLayer />
          <Content canDrag={canDrag}>
            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          </Content>
        </Target>

        {/* Only show columnSettings when sorting and filtering is enabled 
            NOTE: getCanGlobalFilter cannot be used to base render logic on because it is set to false when the table has no data.
          */}
        {column.getCanFilter() && column.getCanSort() && (
          <ColumnSettings columnIsHovered={isHovered} header={header} table={table} />
        )}
      </InnerTh>
      {header.column.getCanResize() && !isLoading && (
        <ResizeHandle
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          isResizing={header.column.getIsResizing()}
          onDoubleClick={() => header.column.resetSize()}
        ></ResizeHandle>
      )}
    </Th>
  );
}

export const Wrapper = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

export const Inner = styled.div<{ initialOffset: XYCoord | null; currentOffset: XYCoord | null }>`
  display: ${({ initialOffset, currentOffset }) => (!initialOffset || !currentOffset ? 'none' : 'block')};
  transform: ${({ currentOffset }) => `translate(${currentOffset?.x}px, ${currentOffset?.y}px)`};
`;

export const CustomDragLayer = forwardRef<HTMLDivElement>((_, ref) => {
  const { itemType, isDragging, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  function renderItem() {
    switch (itemType) {
      case ItemTypes.COLUMN:
        return <div></div>;
      default:
        return null;
    }
  }

  if (!isDragging) {
    return null;
  }

  return (
    <Wrapper ref={ref}>
      <Inner initialOffset={initialOffset} currentOffset={currentOffset}>
        {renderItem()}
      </Inner>
    </Wrapper>
  );
});
