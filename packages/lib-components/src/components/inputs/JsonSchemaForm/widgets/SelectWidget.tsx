import {
  enumOptionsValueForIndex,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericSelect } from '../../Select/Select';
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
  rawErrors,
  required,
  readonly,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions, emptyValue } = options;

  return (
    <GenericSelect
      name={name}
      disabled={disabled}
      loading={false}
      error={rawErrors ? rawErrors[0] : undefined}
      required={required}
      readOnly={readonly}
      onChange={(val) => onChange(val)}
      onBlur={() => {
        /* placeholder */
      }}
      render={(selectedIndex) => (
        <div>
          {enumOptionsValueForIndex(selectedIndex, enumOptions, emptyValue) ??
            'Select...'}
        </div>
      )}
    >
      <OptionGroup label="Games">
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
