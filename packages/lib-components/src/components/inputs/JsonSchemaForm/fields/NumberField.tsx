import { FieldProps } from '@rjsf/utils';
import { GenericTextField } from '../../TextField';
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
    <GenericTextField
      name={name}
      id={idSchema.$id}
      onChange={(e) => {
        if (e.target.value === '') {
          onChange(undefined);
        }
        onChange(e.target.valueAsNumber);
      }}
      disabled={disabled}
      placeholder={placeholder}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={schema.default || 0}
      hasDescription={!!schema.description}
      type="number"
    />
  );
};
