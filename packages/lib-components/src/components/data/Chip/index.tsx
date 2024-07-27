import { forwardRef, ReactElement, cloneElement } from 'react';
import { AiOutlineClose as Icon } from 'react-icons/ai';
import { Container, Dot } from './style';
import { AlertVariants, Color, Variant } from '../../../styled/types';

export type ChipColor = Color | AlertVariants | 'backgroundAccent';

export type ShowIcon = 'always' | 'hover';

export interface ChipProps {
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  dot?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  color: ChipColor;
  variant?: Variant;
  isLoading?: boolean;
  icon?: ReactElement;
  showIcon?: ShowIcon;
}

export const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      color,
      variant = 'default',
      label,
      disabled = false,
      readOnly = false,
      onClick = undefined,
      onDelete = undefined,
      isLoading = false,
      dot = false,
      icon,
      showIcon = 'always',
    },
    ref,
  ) => {
    if (isLoading) {
      return (
        <Container
          ref={ref}
          clickable={!readOnly && !disabled && onClick !== undefined}
          color={color}
          disabled={disabled}
          outline={false}
          onClick={onClick ? onClick : undefined}
          className="placeholder"
          showIcon={showIcon}
        >
          {dot && <Dot color={color} outline={variant !== 'default'} />}
          <span style={{ minWidth: '70px', minHeight: '15px' }}></span>
        </Container>
      );
    }

    return (
      <Container
        ref={ref}
        clickable={onClick !== undefined}
        color={color}
        disabled={disabled}
        onClick={onClick ? onClick : undefined}
        outline={variant !== 'default'}
        showIcon={showIcon}
      >
        {dot && <Dot color={color} outline={variant !== 'default'} />}
        <span>{label}</span>
        {!onDelete && icon && cloneElement(icon, { size: 12, className: 'icon' })}
        {onDelete && !readOnly && !disabled && <Icon onClick={onDelete} size={12} />}
      </Container>
    );
  },
);
