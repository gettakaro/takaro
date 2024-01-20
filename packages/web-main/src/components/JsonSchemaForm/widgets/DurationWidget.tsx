import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { UnControlledDurationField } from '@takaro/lib-components';

export function DurationWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  disabled,
  rawErrors = [],
  required,
  id,
  readonly,
  schema,
  defaultValue,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  return (
    <UnControlledDurationField
      id={id}
      name={name}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={value || defaultValue}
      hasDescription={!!schema.description}
      onChange={onChange}
    />
  );
}
