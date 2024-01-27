import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { useTheme } from '@takaro/lib-components';
import { GenericRadioGroup } from '../../RadioGroup';

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
  const theme = useTheme();

  return (
    <GenericRadioGroup
      id={id}
      name={name}
      value={value}
      readOnly={readonly}
      disabled={disabled}
      onChange={onChange}
      required={required}
      hasError={!!rawErrors.length}
      hasDescription={!!schema.description}
    >
      {enumOptions &&
        enumOptions.map(({ value, label }) => (
          <div
            key={`${id}-${value}-container`}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: theme.spacing[1] }}
          >
            <GenericRadioGroup.Item key={`${id}-${value}-item`} value={value} id={value} />
            <label
              key={`${id}-${value}-label`}
              htmlFor={value}
              style={{ cursor: !disabled && !readonly ? 'pointer' : 'default' }}
            >
              {label}
            </label>
          </div>
        ))}
    </GenericRadioGroup>
  );
}
