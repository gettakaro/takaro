import { styled } from '../../../../../styled';

export const Th = styled.th<{
  isActive: boolean;
  isRight: boolean;
  isDragging: boolean;
  width: number;
  canDrag: boolean;
  isRowSelection: boolean;
}>`
  position: relative;
  width: ${({ width }) => width}px;
  padding: ${({ theme }) => `${theme.spacing['0_75']} 0`};
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};

  &:first-child {
    padding-left: ${({ theme, isRowSelection }) => (isRowSelection ? 0 : theme.spacing['1'])};
  }

  &:last-of-type {
    padding-right: ${({ theme }) => theme.spacing['1']};
  }

  & > div {
    font-weight: 600;
  }

  /* NOTE: Required to match with the resizeHandle */
  border-right: ${({ theme, isActive, isRight }) =>
    isActive && isRight ? `4px solid ${theme.colors.primary}` : `1px solid ${theme.colors.background}`};
  border-left: ${({ theme, isActive, isRight }) =>
    isActive && !isRight ? `4px solid ${theme.colors.primary}` : `1px solid ${theme.colors.background}`};

  &:first-child {
    border-left: ${({ theme, isActive, isRight }) =>
      isActive && !isRight ? `4px solid ${theme.colors.primary}` : 'none'};
    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  &:last-of-type {
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
    border-right: ${({ theme, isActive, isRight }) =>
      isActive && isRight ? `4px solid ${theme.colors.primary}` : `1px solid ${theme.colors.background}`};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
  }
`;

export const InnerTh = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${({ theme }) => theme.spacing['0_5']};
`;

export const Target = styled.div<{ isDragging: boolean }>`
  opacity: ${({ isDragging }) => (isDragging ? 0.1 : 1)};
`;

export const Content = styled.span<{ canDrag: boolean }>`
  cursor: ${({ canDrag }) => (canDrag ? 'grabbing' : 'default')};
`;

export const ResizeHandle = styled.span<{ isResizing: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  right: -1px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  height: 100vh;
  cursor: col-resize;
  user-select: none;
  /* prevents from scrolling while dragging on touch devices */
  touch-action: none;
  opacity: ${({ isResizing }) => (isResizing ? 1 : 0)};
  background-color: ${({ theme, isResizing }) => (isResizing ? theme.colors.primary : theme.colors.backgroundAccent)};
  transition: opacity 0.1s ease-out;

  &:hover {
    opacity: 1;
  }
`;

export const MenuTrigger = styled.div<{ isVisible: boolean }>`
  display: inline-block;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
`;
