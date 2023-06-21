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
  rawErrors = [],
  value,
  required,
  readonly,
  id,
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
      id={id}
      name={name}
      value={value}
      readOnly={readonly}
      disabled={disabled}
      onChange={onChange}
      options={radioOptions}
      required={required}
      hasError={!!rawErrors.length}
    />
  );
}
