import { EnumOptionsType, FieldProps, RJSFSchema } from '@rjsf/utils';
import { GenericTextField } from '../../TextField';
import { RadioWidget } from '../widgets/RadioWidget';
import { SelectWidget } from '../widgets/SelectWidget';

export const StringField = ({
  onChange,
  onBlur,
  disabled,
  placeholder,
  rawErrors,
  required,
  readonly,
  name,
  schema,
  uiSchema,
  registry,
}: FieldProps) => {
  if (
    schema.enum &&
    schema.enum.length &&
    uiSchema &&
    uiSchema['ui:widget'] === 'radioWidget'
  ) {
    return (
      <RadioWidget
        name={name}
        id={name}
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
        onFocus={() => {}}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  if (
    schema.enum &&
    schema.enum.length &&
    uiSchema &&
    uiSchema['ui:widget'] === 'selectWidget'
  ) {
    return (
      <SelectWidget
        name={name}
        id={name}
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
        onFocus={() => {}}
        label={schema.title || name}
        registry={registry}
      />
    );
  }

  return (
    <GenericTextField
      name={name}
      onChange={(val: string) => {
        onChange(val);
      }}
      disabled={disabled}
      placeholder={placeholder}
      hasError={rawErrors ? !!rawErrors.length : false}
      required={required}
      readOnly={readonly}
      value={schema.default?.toString() ?? ''}
      type="text"
    />
  );
};
