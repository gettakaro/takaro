import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { UnControlledSelectField } from '@takaro/lib-components';

export function SelectWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  options,
  disabled,
  rawErrors = [],
  required,
  id,
  readonly,
  schema,
  defaultValue,
  value,
  multiple = false,
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
      /* if it is not required it means it can be set to undefined ? or should we set it to the default value? */
      canClear={!required}
      enableFilter={enumOptions && enumOptions.length > 5}
      readOnly={readonly}
      value={value || defaultValue}
      multiple={multiple}
      hasDescription={!!schema.description}
      onChange={onChange}
      render={(selectedItems) => {
        if (selectedItems.length === 0) {
          return <div>Select...</div>;
        }
        return multiple ? (
          <div>{selectedItems.map((items) => items.label).join(', ')}</div>
        ) : (
          <div>{selectedItems[0].label}</div>
        );
      }}
    >
      <UnControlledSelectField.OptionGroup label="options">
        {enumOptions &&
          enumOptions.map(({ value, label }) => (
            <UnControlledSelectField.Option key={`select-${value}`} value={value} label={label}>
              <div>
                <span>{label}</span>
              </div>
            </UnControlledSelectField.Option>
          ))}
      </UnControlledSelectField.OptionGroup>
    </UnControlledSelectField>
  );
}
