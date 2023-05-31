// TODO: refactor component
// TODO: add boolean dot prop

import { forwardRef, ReactNode } from 'react';
import { AiOutlineClose as Icon } from 'react-icons/ai';
import { Container, Dot } from './style';
import { AlertVariants, Color, Variant } from '../../../styled/types';

export type ChipColor = Color | AlertVariants | 'gray';

export interface ChipProps {
  label: string;
  disabled?: boolean;
  avatar?: ReactNode;
  dot?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  color?: ChipColor;
  variant?: Variant;
  isLoading?: boolean;
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      avatar,
      color = 'gray',
      variant = 'default',
      label,
      disabled = false,
      onClick = undefined,
      onDelete = undefined,
      isLoading = false,
      dot,
    },
    ref
  ) => {
    if (isLoading) {
      return (
        <Container
          ref={ref}
          clickable={onClick !== undefined}
          color={color}
          disabled={disabled}
          hasAvatar={!!avatar}
          outline={false}
          onClick={onClick ? onClick : undefined}
          className="placeholder"
        >
          <>loading</>
        </Container>
      );
    }

    return (
      <Container
        ref={ref}
        clickable={onClick !== undefined}
        color={color}
        disabled={disabled}
        hasAvatar={!!avatar}
        onClick={onClick ? onClick : undefined}
        outline={variant !== 'default'}
      >
        {dot && <Dot color={color} outline={variant !== 'default'} />}
        {avatar}
        <span>{label}</span>
        {onDelete && <Icon onClick={onDelete} size={10} />}
      </Container>
    );
  }
);
