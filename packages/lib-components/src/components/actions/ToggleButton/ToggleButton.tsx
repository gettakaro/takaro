import { FC, ReactNode, MouseEvent } from 'react';
import { Item } from './style';

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
