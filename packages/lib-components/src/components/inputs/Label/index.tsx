import { FC } from 'react';
import { Size } from '../../../styled';
import { Container } from './style';

export type LabelPosition = 'left' | 'right' | 'top' | 'bottom';

export interface LabelProps {
  /// if `true`, the label is displayed in an error state.
  error: boolean;

  /// if `true`, the label will indicate that the input is required
  required: boolean;

  /// the size of the component, usually follows the outer form component
  size: Size;

  /// if `true`, the component is disabled
  disabled: boolean;

  /// Visible text
  text: string;

  /// TODO: hint
  hint?: string;

  /// The id of the element the label is bound to
  htmlFor?: string;

  /// position of the label compared to the element is bound to
  position: LabelPosition;

  ///
  onClick?: () => unknown;
}

export const Label: FC<LabelProps> = ({
  error,
  required,
  // TODO: handle disabled state
  // disabled = false,
  size,
  text,
  hint,
  disabled,
  position,
  onClick = () => {},
}) => {
  if (!hint && required) {
    hint = 'Required';
  } else if (hint && required) {
    hint += '*';
  }

  const handleOnClick = () => {
    onClick();
  };

  return (
    <Container
      onClick={handleOnClick}
      error={error}
      size={size}
      position={position}
      disabled={disabled}
    >
      {text}
      <span>{hint}</span>
    </Container>
  );
};
