import { cloneElement, forwardRef, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { Spinner } from '../../../components';
import { ButtonColor, Default, Outline, Clear, White } from './style';
import { Size, Variant } from '../../../styled';

export interface ButtonProps {
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
  isLoading?: boolean;
  icon?: ReactElement;
  iconPosition?: 'left' | 'right';
  className?: string;
  fullWidth?: boolean;
  size?: Size;
  type?: 'submit' | 'reset' | 'button';
  // TODO: clear should be renamed to text
  variant?: Variant | 'white' | 'clear';
  color?: ButtonColor | 'white';
  text: string;

  /// When nesting forms a button can be linked to only fire the form with the given name.
  form?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon,
      iconPosition = 'left',
      size = 'medium',
      type = 'button',
      isLoading = false,
      className,
      form,
      text,
      color = 'primary',
      disabled = false,
      fullWidth = false,
      variant = 'default',
      onClick = () => {},
    },
    ref,
  ) => {
    function getIcon(): JSX.Element {
      if (isLoading) return <Spinner color={variant === 'default' ? 'white' : color} size="small" />;

      if (icon) return cloneElement(icon, { size: 20 });

      return <></>;
    }

    function getVariant(): JSX.Element {
      const props = {
        className: className,
        color: color,
        disabled: disabled,
        iconPosition: iconPosition,
        form: form,
        icon: !!icon,
        isLoading: isLoading,
        onClick: !disabled || !isLoading ? onClick : undefined,
        size: size,
        fullWidth: fullWidth,
        type: type,
        ref: ref,
        tabIndex: disabled ? -1 : 0,
      };

      switch (variant) {
        case 'default':
          return (
            <Default {...props}>
              {iconPosition === 'left' && getIcon()} <span>{text}</span> {iconPosition === 'right' && getIcon()}
            </Default>
          );
        case 'outline':
          return (
            <Outline {...props}>
              {iconPosition === 'left' && getIcon()} <span>{text}</span> {iconPosition === 'right' && getIcon()}
            </Outline>
          );
        case 'clear':
          return (
            <Clear {...props}>
              {iconPosition === 'left' && getIcon()} <span>{text}</span> {iconPosition === 'right' && getIcon()}
            </Clear>
          );
        case 'white':
          return (
            <White {...props}>
              {iconPosition === 'left' && getIcon()} <span>{text}</span> {iconPosition === 'right' && getIcon()}
            </White>
          );
      }
    }

    return getVariant();
  },
);
