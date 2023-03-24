import { Control, FieldValues } from 'react-hook-form';
import { Size } from '../../styled';

interface DefaultInputProps {
  required?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: Size;
}

export interface InputProps extends DefaultInputProps {
  control: Control<FieldValues> | Control<any>;
  name: string;
  /// These can just have undefined as default value.
  label?: string;
  hint?: string;
  description?: string;
  value?: unknown;
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
