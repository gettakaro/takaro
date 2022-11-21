import { ReactElement } from 'react';
import { FormProps } from '../FormProps';

export interface FieldProps extends FormProps {
  name: string;
  icon?: ReactElement;
  readOnly?: boolean;
  placeholder: string;
  prefix?: string;
  suffix?: string;
  type?: 'text' | 'password';
}
