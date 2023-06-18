import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  FieldProps,
} from '@rjsf/utils';
import { GenericTagField } from '../../TagField/Generic';

export function ArrayField<
  T = string[],
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  name,
  disabled,
  rawErrors = [],
  readonly,
  value,
  required,
  onChange,
}: FieldProps<T, S, F>) {
  return (
    <GenericTagField
      name={name}
      value={value}
      disabled={disabled}
      onChange={(val) => onChange(val as T)}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
    />
  );
}
