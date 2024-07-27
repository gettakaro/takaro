import { Tooltip } from '../../../components';
import { forwardRef, ReactNode, MouseEvent } from 'react';
import { Item } from './style';

export interface ToggleButtonProps {
  children?: ReactNode;
  disabled?: boolean;
  onChange?: (event: MouseEvent<HTMLElement>, value: unknown) => void;
  selected?: boolean;
  onClick?: () => unknown;
  parentClickEvent?: (value: unknown) => unknown;
  value: NonNullable<string>;
  tooltip?: string;
}

export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    { selected = false, disabled = false, onClick = undefined, value, parentClickEvent = () => {}, children, tooltip },
    ref,
  ) => {
    const handleOnClick = () => {
      if (disabled) return;
      parentClickEvent(value);
      if (onClick) {
        onClick();
      }
    };

    if (tooltip) {
      return (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Item isSelected={selected} isDisabled={disabled} onClick={handleOnClick} ref={ref}>
              {children}
            </Item>
          </Tooltip.Trigger>
          <Tooltip.Content>{tooltip}</Tooltip.Content>
        </Tooltip>
      );
    }

    return (
      <Item isSelected={selected} isDisabled={disabled} onClick={handleOnClick} ref={ref}>
        {children}
      </Item>
    );
  },
);
