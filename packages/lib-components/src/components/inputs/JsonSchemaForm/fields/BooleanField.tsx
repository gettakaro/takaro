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
  rawErrors = [],
  readonly,
  value,
  required,
  onChange,
  onBlur,
  onFocus,
  idSchema,
  uiSchema,
  schema,
  registry,
}: FieldProps<T, S, F>) {
  if (uiSchema && uiSchema['ui:widget'] === 'checkbox') {
    return (
      <CheckBoxWidget
        name={name}
        id={idSchema.$id}
        schema={schema}
        value={schema.default ?? false}
        onChange={onChange}
        options={{}}
        onBlur={onBlur}
        disabled={disabled}
        onFocus={onFocus}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  return (
    <GenericSwitch
      id={idSchema.$id}
      name={name}
      onChange={(val: boolean) => onChange(val as T)}
      value={value}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
    />
  );
}
