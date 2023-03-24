import { FC, ReactNode, MouseEvent } from 'react';
import { styled } from '../../../styled';

const Item = styled.button<{ isSelected: boolean; isDisabled: boolean }>`
  color: none;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: block;
  border-radius: 0;
  width: 100%;
  position: relative;
  border-left: none;
  background-color: ${({ theme, isSelected, isDisabled }) =>
    isSelected
      ? theme.colors.primary
      : isDisabled
      ? theme.colors.gray
      : 'none'};
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};

  svg {
    fill: ${({ theme }) => theme.colors.text};
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
