import { FormContextType, RJSFSchema, StrictRJSFSchema, FieldProps } from '@rjsf/utils';
import { CheckBoxWidget } from '../widgets/CheckboxWidget';

export function BooleanField<T = boolean, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  disabled,
  onChange,
  onBlur,
  onFocus,
  idSchema,
  required,
  readonly,
  schema,
  formData,
  registry,
  uiSchema,
}: FieldProps<T, S, F>) {
  return (
    <CheckBoxWidget
      name={name}
      id={idSchema.$id}
      schema={schema}
      value={formData}
      onChange={onChange}
      options={{}}
      onBlur={onBlur}
      disabled={disabled}
      required={required}
      readonly={readonly}
      onFocus={onFocus}
      label={schema.title || name}
      registry={registry}
      uiSchema={uiSchema}
    />
  );
}
