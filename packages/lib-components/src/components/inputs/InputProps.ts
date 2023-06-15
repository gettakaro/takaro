import { Control, FieldValues } from 'react-hook-form';
import { Size } from '../../styled';

// Props that available on all fields (but no default value)
interface InputProps extends DefaultInputProps {
  name: string;
}

// Props for generic input props
export interface GenericInputProps<T> extends InputProps {
  value: unknown;
  hasError: boolean;
  onChange: React.changeEventHandler<T>;
  onBlur?: React.focusEventHandler<T>;
  onFocus?: React.focusEventHandler<T>;
}

export interface ControlledInputProps extends InputProps {
  control: Control<FieldValues> | Control<any>;
  label?: string;
  loading?: boolean;
  hint?: string;
  description?: string;
}

// All input components have a set of props in common which all should have the same default values.
interface DefaultInputProps {
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: Size;
}

type Required<T> = {
  [P in keyof T]-?: T[P];
};
export const defaultInputProps: Required<DefaultInputProps> = {
  required: false,
  readOnly: false,
  disabled: false,
  size: 'medium',
};

export function defaultInputPropsFactory<T extends InputProps>(
  defaultValues: Required<DefaultInputProps>
) {
  return (values: T) =>
    Object.assign({} as Required<DefaultInputProps> & T, defaultValues, values);
}
