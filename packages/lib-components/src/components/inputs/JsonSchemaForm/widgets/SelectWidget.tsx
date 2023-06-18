import {
  enumOptionsValueForIndex,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericSelect } from '../../Select/Generic';
import { OptionGroup, Option } from '../../../../components';

// TODO: implement multiselect
export function SelectWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  name,
  options,
  disabled,
  rawErrors = [],
  required,
  readonly,
  value,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions, emptyValue } = options;

  return (
    <GenericSelect
      name={name}
      disabled={disabled}
      hasError={!!rawErrors.length}
      required={required}
      readOnly={readonly}
      value={value}
      onChange={onChange}
      render={(selectedIndex) => (
        <div>
          {enumOptionsValueForIndex(selectedIndex, enumOptions, emptyValue) ??
            'Select...'}
        </div>
      )}
    >
      <OptionGroup label="options">
        {enumOptions &&
          enumOptions.map(({ value, label }) => (
            <Option key={`select-${value}`} value={value}>
              <div>
                <span>{label}</span>
              </div>
            </Option>
          ))}
      </OptionGroup>
    </GenericSelect>
  );
}
