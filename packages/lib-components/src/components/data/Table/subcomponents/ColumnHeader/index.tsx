import { Column, ColumnOrderState, Header, Table, flexRender } from '@tanstack/react-table';
import { useDrag, useDragLayer, useDrop, XYCoord } from 'react-dnd';
import { ColumnSettings } from './ColumnSettings';
import { Identifier } from 'dnd-core';
import { styled } from '../../../../../styled';
import { FC, forwardRef, useEffect } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

const ItemTypes = {
  COLUMN: 'column',
};

interface CollectedProps {
  handlerId: Identifier | null;
  isActive: boolean;
  isRight: boolean;
}

const Container = styled.th<{ isActive: boolean; isRight: boolean; isDragging: boolean; width: number }>`
  position: relative;
  width: ${({ width }) => width}px;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing[2]}`};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};

  border-right: ${({ theme, isActive, isRight }) =>
    isActive && isRight ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.backgroundAlt}`};
  border-left: ${({ theme, isActive, isRight }) =>
    isActive && !isRight ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.backgroundAlt}`};
  cursor: grab;

  &:first-child {
    border-left: ${({ theme, isActive, isRight }) =>
      isActive && !isRight ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.backgroundAlt}`};
    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  &:last-of-type {
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
    border-right: ${({ theme, isActive, isRight }) =>
      isActive && isRight ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.backgroundAlt}`};
  }

  &:active {
    cursor: grabbing;
  }

  & > div {
    font-weight: 600;
  }
`;

const Target = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 0 : 1)};
  height: ${({ isDragging }) => (isDragging ? 0 : '')};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ResizeHandle = styled.div<{ isResizing: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  right: -3px;
  height: 100vh;
  cursor: col-resize;
  user-select: none;
  /* prevents from scrolling while dragging on touch devices */
  touch-action: none;
  opacity: ${({ isResizing }) => (isResizing ? 1 : 0)};
  background-color: ${({ theme, isResizing }) => (isResizing ? theme.colors.primary : theme.colors.secondary)};
`;

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
  });

  function attachRef(el: HTMLDivElement) {
    dropRef(el);
    dragRef(el);
  }

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => column,
    type: ItemTypes.COLUMN,
  });

  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  return (
    <Container
      colSpan={header.colSpan}
      scope="col"
      isDragging={isDragging}
      isActive={isActive}
      isRight={isRight}
      width={header.getSize()}
    >
      <Target ref={attachRef} isDragging={isDragging} role="DraggableBox" draggable={true} aria-dropeffect="move">
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

interface CustomDragPreviewProps {
  title?: string;
}

const CustomDragPreview: FC<CustomDragPreviewProps> = ({ title = '' }) => {
  return <div>{title}</div>;
};

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
        return <CustomDragPreview />;
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
