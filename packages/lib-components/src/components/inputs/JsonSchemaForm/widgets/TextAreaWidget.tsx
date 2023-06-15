import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericTextAreaField } from '../../TextAreaField';

export function TextareaWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  options,
  disabled,
  readonly,
  onChange,
  name,
  value,
  rawErrors = [],
}: WidgetProps<T, S, F>) {
  let rows: string | number = 5;
  if (typeof options.rows === 'string' || typeof options.rows === 'number') {
    rows = options.rows;
  }

  return (
    <GenericTextAreaField
      name={name}
      onChange={onChange}
      rows={rows}
      value={value}
      disabled={disabled}
      readOnly={readonly}
      hasError={!!rawErrors.length}
    />
  );
}
