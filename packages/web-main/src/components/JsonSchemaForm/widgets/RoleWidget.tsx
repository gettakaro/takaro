import { FormContextType, RJSFSchema, StrictRJSFSchema, WidgetProps } from '@rjsf/utils';
import { UnControlledRoleSelectQueryField } from '../../selects';

export function RoleWidget<T = unknown, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>({
  name,
  disabled,
  rawErrors = [],
  required,
  readonly,
  schema,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  const multiple = schema.type === 'array';

  return (
    <UnControlledRoleSelectQueryField
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      readOnly={readonly}
      multiple={multiple}
      canClear={!required}
      includeSpecialRoles={true}
      hasError={!!rawErrors.length}
    />
  );
}
