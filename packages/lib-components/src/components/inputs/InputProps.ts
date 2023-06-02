import { Control, FieldValues } from 'react-hook-form';
import { Size } from '../../styled';

// These fields that auto set a default value (see: factory below)
interface DefaultInputProps {
  required?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: Size;
}

// these are input fields that should be available both on generic
interface InputProps extends DefaultInputProps {
  name: string;
  label?: string;
  hint?: string;
  description?: string;
}

export interface GenericInputProps extends InputProps {
  value: unknown;
  error?: string;
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
}

export interface ControlledInputProps extends InputProps {
  control: Control<FieldValues> | Control<any>;
}

type Required<T> = {
  [P in keyof T]-?: T[P];
};

export const defaultInputProps: Required<DefaultInputProps> = {
  required: false,
  loading: false,
  readOnly: false,
  disabled: false,
  size: 'medium',
};

// All input components have a set of props in common which all should have the same default values.
export function defaultInputPropsFactory<T extends InputProps>(
  defaultValues: Required<DefaultInputProps>
) {
  return (values: T) =>
    Object.assign({} as Required<DefaultInputProps> & T, defaultValues, values);
}
