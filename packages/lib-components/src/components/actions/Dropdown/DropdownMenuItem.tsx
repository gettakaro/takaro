import { useListItem } from '@floating-ui/react';
import { cloneElement, FC, ReactElement, MouseEvent } from 'react';
import { useDropdownContext } from './DropdownContext';
import { styled } from '../../../styled';
import { IconButton } from '../IconButton';
import { AiOutlineClose as UndoIcon } from 'react-icons/ai';

const Container = styled.button<{ isActive: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.background)};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['0_75']}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
  }

  div {
    svg {
      margin-right: ${({ theme }) => theme.spacing['0_75']};
    }
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  button {
    margin-left: ${({ theme }) => theme.spacing['0_75']};
  }
`;

interface DropdownMenuItemProps {
  label: string;
  disabled?: boolean;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
}

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  label,
  disabled,
  onClick,
  iconPosition = 'left',
  active = false,
  icon,
}) => {
  const { activeIndex, setOpen, getItemProps } = useDropdownContext();
  const { ref, index } = useListItem();

  const isActive = activeIndex === index;

  const getIcon = () => {
    if (icon) return cloneElement(icon, { size: 16 });
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick(e);
    setOpen(false);
  };

  const handleMouseUp = (e: MouseEvent<HTMLButtonElement>) => {
    onClick(e);
    setOpen(false);
  };

  return (
    <Container
      type="button"
      onClick={(e) => handleClick(e)}
      onMouseUp={handleMouseUp}
      isActive={isActive}
      ref={ref}
      tabIndex={disabled ? -1 : 0}
      role="menuitem"
      disabled={disabled}
      {...getItemProps({
        onClick: handleClick,
        onMouseUp: handleMouseUp,
      })}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        {icon && iconPosition === 'left' && getIcon()}
        {label}
        {icon && iconPosition === 'right' && getIcon()}
      </div>
      {active && <IconButton icon={<UndoIcon />} ariaLabel="undo action" size="tiny" />}
    </Container>
  );
};
