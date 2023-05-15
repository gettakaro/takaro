import { GenericSwitch } from '../../Switch';
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  FieldProps,
} from '@rjsf/utils';

export function BooleanField<
  T = boolean,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  name,
  disabled,
  rawErrors,
  readonly,
  required,
  onChange,
}: FieldProps<T, S, F>) {
  return (
    <GenericSwitch
      name={name}
      onChange={(val) => onChange(val as T)}
      onBlur={() => {}}
      disabled={disabled}
      loading={false}
      error={rawErrors ? rawErrors[0] : undefined}
      required={required}
      label="TODO: not sure where the label should come from"
      readOnly={readonly}
    />
  );
}
