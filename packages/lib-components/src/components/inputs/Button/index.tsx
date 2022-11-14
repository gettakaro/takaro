import {
  cloneElement,
  FC,
  MouseEvent as ReactMouseEvent,
  ReactElement,
} from 'react';
import { Spinner } from '../..';
import { ButtonColor, Default, Outline, Clear, White } from './style';
import { Size, Variant } from '../../../styled/types';

export interface ButtonProps {
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
  isLoading?: boolean;
  icon?: ReactElement;
  className?: string;
  size?: Size;
  type?: 'submit' | 'reset' | 'button';
  variant?: Variant | 'white';
  color?: ButtonColor;
  text: string;

  /// When nesting forms a button can be linked to only fire the form with the given name.
  form?: string;
}

export const Button: FC<ButtonProps> = ({
  icon,
  size = 'medium',
  type = 'button',
  isLoading = false,
  className,
  form,
  text,
  color = 'primary',
  disabled = false,
  variant = 'default',
  onClick = () => {},
}) => {
  function getIcon(): JSX.Element {
    if (isLoading)
      return (
        <Spinner color={variant === 'default' ? 'white' : color} size="small" />
      );

    if (icon) return cloneElement(icon, { size: 20 });

    return <></>;
  }

  function getVariant(): JSX.Element {
    const props = {
      className: className,
      color: color,
      disabled: disabled,
      form: form,
      icon: !!icon,
      isLoading: isLoading,
      onClick: !disabled || !isLoading ? onClick : undefined,
      size: size,
      [type]: type,
    };

    switch (variant) {
      case 'default':
        return (
          <Default {...props}>
            {getIcon()} <span>{text}</span>
          </Default>
        );
      case 'outline':
        return (
          <Outline {...props}>
            {getIcon()} <span>{text}</span>{' '}
          </Outline>
        );
      case 'clear':
        return (
          <Clear {...props}>
            {getIcon()} <span>{text}</span>
          </Clear>
        );
      case 'white':
        return (
          <White {...props}>
            {getIcon()} <span>{text}</span>
          </White>
        );
    }
  }

  return getVariant();
};
