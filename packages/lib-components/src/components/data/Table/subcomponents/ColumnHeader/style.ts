import { styled } from '../../../../../styled';

export const Container = styled.th<{ isActive: boolean; isRight: boolean; isDragging: boolean; width: number }>`
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
      isActive && !isRight ? `2px solid ${theme.colors.primary}` : 'none'};
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

export const Target = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 0.1 : 1)};
`;

export const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ResizeHandle = styled.div<{ isResizing: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  right: -1px;
  height: 100vh;
  cursor: col-resize;
  user-select: none;
  /* prevents from scrolling while dragging on touch devices */
  touch-action: none;
  opacity: ${({ isResizing }) => (isResizing ? 1 : 0)};
  background-color: ${({ theme, isResizing }) => (isResizing ? theme.colors.primary : theme.colors.secondary)};
`;
