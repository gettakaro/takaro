import { GenericSwitch } from '../../Switch';
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  FieldProps,
} from '@rjsf/utils';
import { CheckBoxWidget } from '../widgets/CheckboxWidget';

export function BooleanField<
  T = boolean,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  name,
  disabled,
  rawErrors,
  readonly,
  value,
  required,
  onChange,
  uiSchema,
  schema,
  registry,
}: FieldProps<T, S, F>) {
  if (uiSchema && uiSchema!['ui:widget'] === 'checkbox') {
    return (
      <CheckBoxWidget
        name={name}
        id={name}
        schema={schema}
        value={schema.default ?? false}
        options={{}}
        onChange={onChange}
        onBlur={() => {}}
        disabled={disabled}
        onFocus={() => {}}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  return (
    <GenericSwitch
      name={name}
      onChange={(val) => onChange(val as T)}
      onBlur={() => {}}
      value={value}
      disabled={disabled}
      loading={false}
      error={rawErrors ? rawErrors[0] : undefined}
      required={required}
      label={name}
      readOnly={readonly}
    />
  );
}
