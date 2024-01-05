import { FieldProps } from '@rjsf/utils';
import { UnControlledTextField } from '@takaro/lib-components';
import { RangeWidget } from '../widgets/RangeWidget';

export const NumberField = ({
  onChange,
  onBlur,
  onFocus,
  disabled,
  placeholder,
  rawErrors = [],
  required,
  readonly,
  idSchema,
  formData,
  name,
  schema,
  uiSchema,
  registry,
}: FieldProps) => {
  if (uiSchema && uiSchema['ui:widget'] === 'slider') {
    return (
      <RangeWidget
        name={name}
        id={name}
        label={schema.title || name}
        options={{}}
        min={schema.minimum ? schema.minimum : 0}
        max={schema.maximum ? schema.maximum : 100}
        showDots={true}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        schema={schema}
        value={schema.default}
        registry={registry}
      />
    );
  }

  return (
    <UnControlledTextField
      name={name}
      id={idSchema.$id}
      onChange={(e) => {
        if (e.target.value === '') {
          onChange(undefined);
        }

        const value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
          onChange(undefined);
        } else {
          onChange(value);
        }
      }}
      disabled={disabled}
      placeholder={placeholder}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={formData || 0}
      hasDescription={!!schema.description}
      type="number"
    />
  );
};
