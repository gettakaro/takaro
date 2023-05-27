import { FieldProps } from '@rjsf/utils';
import { GenericTextField } from '../../TextField';
import { RangeWidget } from '../widgets/RangeWidget';

export const NumberField = ({
  onChange,
  onBlur,
  onFocus,
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
  if (uiSchema && uiSchema!['ui:widget'] === 'slider') {
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
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      loading={false}
      error={rawErrors ? rawErrors[0] : undefined}
      required={required}
      readOnly={readonly}
      type="number"
    />
  );
};
