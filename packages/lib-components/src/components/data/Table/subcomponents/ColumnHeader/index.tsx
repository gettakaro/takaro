import { Column, ColumnOrderState, Header, Table, flexRender } from '@tanstack/react-table';
import { useDrag, useDragLayer, useDrop, XYCoord } from 'react-dnd';
import { ColumnSettings } from './ColumnSettings';
import { Identifier } from 'dnd-core';
import { styled } from '../../../../../styled';
import { forwardRef, useEffect, useRef } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Target, Content, Container, ResizeHandle } from './style';

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
}

const reorder = (draggedColumnId: string, targetColumnId: string, columnOrder: string[]): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string
  );
  return [...columnOrder];
};

export function ColumnHeader<DataType extends object>({ header, table }: ColumnHeaderProps<DataType>) {
  const { getState, setColumnOrder } = table;
  const { columnOrder } = getState();
  const { column } = header;
  const ref = useRef<HTMLDivElement>(null);

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
    <Container
      colSpan={header.colSpan}
      scope="col"
      isDragging={isDragging}
      isActive={isActive}
      isRight={isRight}
      width={header.getSize()}
    >
      <Target ref={ref} isDragging={isDragging} role="DraggableBox" draggable={true} aria-dropeffect="move">
        <CustomDragLayer />
        <Content>
          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
          <ColumnSettings header={header} table={table} />
        </Content>
      </Target>
      {header.column.getCanResize() && (
        <ResizeHandle
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          isResizing={header.column.getIsResizing()}
        ></ResizeHandle>
      )}
    </Container>
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
