import { Control, FieldError, FieldValues } from 'react-hook-form';
import { Size } from 'styled';

export type FormProps = {
  control: Control<FieldValues> | Control<any>;
  label?: string;
  required?: boolean;
  hint?: string;
  error?: FieldError | undefined;
  loading?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  size?: Size;
};

export function setDefaultValues() {
  return {
    loading: false,
    readOnly: false,
    disabled: false,
    size: 'medium',
  };
}
