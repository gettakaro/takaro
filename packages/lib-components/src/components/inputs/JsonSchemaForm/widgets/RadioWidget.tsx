import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericRadioGroup, Option } from '../../RadioGroup';

// TODO: implement multiselect
export function RadioWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  name,
  options,
  disabled,
  rawErrors,
  required,
  label,
  readonly,
  onChange,
}: WidgetProps<T, S, F>) {
  const { enumOptions } = options;

  const radioOptions: Option[] = enumOptions
    ? enumOptions.map((option) => {
        return {
          labelPosition: 'left',
          label: option.label,
          value: option.value,
        };
      })
    : [];

  return (
    <GenericRadioGroup
      name={name}
      readOnly={readonly}
      disabled={disabled}
      label={label}
      onChange={onChange}
      onBlur={() => {
        /* placeholder */
      }}
      options={radioOptions}
      required={required}
      error={rawErrors ? rawErrors[0] : undefined}
    />
  );
}
