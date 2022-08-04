import { ReactElement } from 'react';
import { FieldError, Control } from 'react-hook-form';

export interface FieldProps {
  name: string;
  icon?: ReactElement;
  readOnly?: boolean;
  label: string;
  placeholder: string;
  prefix?: string;
  suffix?: string;
  error?: FieldError;
  loading?: boolean;
  control: Control<any, object>;
  hint?: string;
  required?: boolean;
  type?: 'text' | 'password';
}
