import { FC, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { Spinner } from '../..';
import { Container } from './style';
import { Color, Size, Variant, AlertVariants } from '../../../styled/types';

export interface ButtonProps {
  disabled?: boolean;
  onClick?: (event: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => unknown;
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
  size?: Size;
  type?: 'submit' | 'reset' | 'button';
  variant?: Variant;
  color?: Color | AlertVariants | 'background';
  text: string;
  isWhite?: boolean;
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
  isWhite = false,
  variant = 'default',
  onClick = null
}) => {
  function content(): JSX.Element {
    return (
      <>
        {isLoading ? (
          <Spinner color={variant === 'outline' ? color : 'white'} size="small" />
        ) : (
          icon
        )}
        <span>{text}</span>
      </>
    );
  }

  return (
    <Container
      className={className}
      color={color}
      disabled={disabled}
      form={form}
      icon={!!icon}
      isLoading={isLoading}
      onClick={disabled || isLoading || !onClick ? undefined : onClick}
      outline={variant === 'outline'}
      size={size}
      type={type}
      white={isWhite}
    >
      {content()}
    </Container>
  );
};
