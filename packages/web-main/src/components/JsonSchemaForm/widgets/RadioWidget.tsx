import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { UnControlledRadioGroup } from '@takaro/lib-components';

export function RadioWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  options,
  disabled,
  rawErrors = [],
  value,
  required,
  readonly,
  schema,
  id,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions } = options;

  const radioOptions: any[] = enumOptions
    ? enumOptions.map((option) => {
        return {
          labelPosition: 'left',
          label: option.label,
          value: option.value,
        };
      })
    : [];

  return (
    <UnControlledRadioGroup
      id={id}
      name={name}
      value={value}
      readOnly={readonly}
      disabled={disabled}
      onChange={onChange}
      options={radioOptions}
      required={required}
      hasError={!!rawErrors.length}
      hasDescription={!!schema.description}
    />
  );
}
