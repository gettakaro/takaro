import { enumOptionsValueForIndex, FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { GenericSelectField } from '../../selects/SelectField/Generic';

// TODO: implement multiselect
export function SelectWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  options,
  disabled,
  rawErrors = [],
  required,
  id,
  readonly,
  schema,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions, emptyValue } = options;

  return (
    <GenericSelectField
      id={id}
      name={name}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={value}
      hasDescription={!!schema.description}
      onChange={onChange}
      render={(selectedItems) => (
        <div>{enumOptionsValueForIndex(selectedItems[0].value, enumOptions, emptyValue) ?? 'Select...'}</div>
      )}
    >
      <GenericSelectField.OptionGroup label="options">
        {enumOptions &&
          enumOptions.map(({ value, label }) => (
            <GenericSelectField.Option key={`select-${value}`} value={value} label={value}>
              <div>
                <span>{label}</span>
              </div>
            </GenericSelectField.Option>
          ))}
      </GenericSelectField.OptionGroup>
    </GenericSelectField>
  );
}
