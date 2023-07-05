import { ChangeEventHandler, FocusEventHandler } from 'react';
import { Control, FieldValues } from 'react-hook-form';
import { Size } from '../../styled';

// Props that available on all fields (but no default value)
interface InputProps extends DefaultInputProps {
  name: string;
}

// Props for generic input props
export interface GenericInputProps<V, T> extends InputProps {
  value: V;
  // Although name could be used as a unique field identifier, name is not retrievable in JsonSchemaForm/FieldTemplate
  id: string;
  hasDescription: boolean;
  hasError: boolean;
  onChange: ChangeEventHandler<T>;
  onBlur?: FocusEventHandler<T>;
  onFocus?: FocusEventHandler<T>;
}
export interface GenericInputPropsFunctionHandlers<V, D> extends InputProps {
  value: V;
  id: string;
  hasError: boolean;
  hasDescription: boolean;
  onChange: (val: V) => void;
  onBlur?: FocusEventHandler<D>;
  onFocus?: FocusEventHandler<D>;
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

export function defaultInputPropsFactory<T extends InputProps>(defaultValues: Required<DefaultInputProps>) {
  return (values: T) => Object.assign({} as Required<DefaultInputProps> & T, defaultValues, values);
}
