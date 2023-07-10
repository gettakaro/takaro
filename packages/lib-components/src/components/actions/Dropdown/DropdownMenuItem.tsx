import { useListItem } from '@floating-ui/react';
import { cloneElement, FC, ReactElement, MouseEvent } from 'react';
import { useDropdownContext } from './DropdownContext';
import { styled } from '../../../styled';

const Container = styled.button<{ isActive: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.background)};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing[1]} ${theme.spacing[1]}`};

  &:first-of-type {
    border-top-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-top-right-radius: ${({ theme }) => theme.borderRadius.medium};
  }

  &:last-of-type {
    border-bottom-left-radius: ${({ theme }) => theme.borderRadius.medium};
    border-bottom-right-radius: ${({ theme }) => theme.borderRadius.medium};
    margin-bottom: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }

  svg,
  div {
    margin-right: ${({ theme }) => theme.spacing['0_75']};
  }
`;

interface DropdownMenuItemProps {
  label: string;
  disabled?: boolean;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export const DropdownMenuItem: FC<DropdownMenuItemProps> = ({
  label,
  disabled,
  onClick,
  iconPosition = 'left',
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
      {icon && iconPosition === 'left' && getIcon()}
      {label}
      {icon && iconPosition === 'right' && getIcon()}
    </Container>
  );
};
