import { FC, ReactNode, MouseEvent } from 'react';
import { styled } from '../../../styled';

const Item = styled.button<{ isSelected: boolean; isDisabled: boolean }>`
  color: none;
  display: block;
  border-radius: 0;
  width: 100%;
  position: relative;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: 400;
  border-left: none;
  background-color: ${({ theme, isSelected, isDisabled }) =>
    isSelected
      ? theme.colors.primary
      : isDisabled
      ? theme.colors.disabled
      : theme.colors.background};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  svg {
    fill: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.white : theme.colors.text};
  }
`;

export interface ToggleButtonProps {
  children?: ReactNode;
  disabled?: boolean;
  onChange?: (event: MouseEvent<HTMLElement>, value: unknown) => void;
  selected?: boolean;
  onClick?: () => unknown;
  parentClickEvent?: (value: unknown) => unknown;
  value: NonNullable<string>;
}

export const ToggleButton: FC<ToggleButtonProps> = ({
  selected = false,
  disabled = false,
  onClick = undefined,
  value,
  parentClickEvent = () => {},
  children,
}) => {
  const handleOnClick = () => {
    if (disabled) return;
    parentClickEvent(value);
    if (onClick) {
      onClick();
    }
  };

  return (
    <Item isSelected={selected} isDisabled={disabled} onClick={handleOnClick}>
      {children}
    </Item>
  );
};
