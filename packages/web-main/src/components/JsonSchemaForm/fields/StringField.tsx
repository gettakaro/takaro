import { EnumOptionsType, FieldProps, RJSFSchema } from '@rjsf/utils';
import { UnControlledTextField } from '@takaro/lib-components';
import { RadioWidget } from '../widgets/RadioWidget';
import { SelectWidget } from '../widgets/SelectWidget';

export const StringField = ({
  onChange,
  onBlur,
  disabled,
  placeholder,
  rawErrors = [],
  required,
  readonly,
  name,
  schema,
  onFocus,
  idSchema,
  formData,
  uiSchema,
  registry,
}: FieldProps) => {
  if (schema.enum && schema.enum.length && uiSchema && uiSchema['ui:widget'] === 'radioWidget') {
    return (
      <RadioWidget
        name={name}
        id={idSchema.$id}
        schema={schema}
        value={schema.enum[0]}
        options={{
          enumOptions: schema.enum.map((e) => {
            return {
              value: e,
              label: e,
              schema,
            } as EnumOptionsType<RJSFSchema>;
          }),
        }}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={onFocus}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  if (schema.enum) {
    return (
      <SelectWidget
        name={name}
        id={idSchema.$id}
        schema={schema}
        value={schema.enum[0]}
        options={{
          enumOptions: schema.enum.map((e) => {
            return {
              value: e,
              label: e,
              schema,
            } as EnumOptionsType<RJSFSchema>;
          }),
        }}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        placeholder={placeholder}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  return (
    <UnControlledTextField
      name={name}
      id={idSchema.$id}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      hasError={!!rawErrors.length}
      hasDescription={!!schema.description}
      required={required}
      readOnly={readonly}
      value={formData as string}
      type="text"
    />
  );
};
