import { useListItem } from '@floating-ui/react';
import { cloneElement, FC, ReactElement } from 'react';
import { useDropdownContext } from './DropdownContext';
import { styled } from '../../../styled';

const Container = styled.button<{ isActive: boolean }>`
  background-color: ${({ theme, isActive }) => (isActive ? theme.colors.secondary : theme.colors.backgroundAlt)};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

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

  div {
    width: 18px;
    height: 18px;
  }
`;

interface DropdownMenuItemProps {
  label: string;
  disabled?: boolean;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  onClick: () => void;
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
    if (icon) return cloneElement(icon, { size: 18 });
  };

  const handleClick = () => {
    onClick();
    setOpen(false);
  };

  const handleMouseUp = () => {
    setOpen(false);
  };

  return (
    <Container
      onClick={handleClick}
      onMouseUp={handleMouseUp}
      isActive={isActive}
      ref={ref}
      tabIndex={disabled ? -1 : 0}
      role="menuitem"
      disabled={disabled}
      {...getItemProps()}
    >
      {icon && iconPosition === 'left' && getIcon()}
      {iconPosition === 'left' && !icon && <div aria-hidden />}
      {label}
      {icon && iconPosition === 'right' && getIcon()}
      {iconPosition === 'right' && !icon && <div aria-hidden />}
    </Container>
  );
};
