import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { UnControlledSelectField } from '@takaro/lib-components';

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
  const { enumOptions } = options;

  return (
    <UnControlledSelectField
      id={id}
      name={name}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={value}
      hasDescription={!!schema.description}
      onChange={onChange}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return <div>{selectedItems[0].label}</div>;
      }}
    >
      <UnControlledSelectField.OptionGroup label="options">
        {enumOptions &&
          enumOptions.map(({ value, label }) => (
            <UnControlledSelectField.Option key={`select-${value}`} value={value} label={value}>
              <div>
                <span>{label}</span>
              </div>
            </UnControlledSelectField.Option>
          ))}
      </UnControlledSelectField.OptionGroup>
    </UnControlledSelectField>
  );
}
