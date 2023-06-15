import {
  schemaRequiresTrueValue,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { GenericCheckBox } from '../../CheckBox';

export function CheckBoxWidget<
  T = unknown,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    schema,
    name,
    disabled,
    readonly,
    onChange,
    value,
    rawErrors = [],
  } = props;

  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema);

  return (
    <GenericCheckBox
      name={name}
      value={value}
      readOnly={readonly}
      disabled={disabled}
      onChange={onChange}
      required={required}
      hasError={!!rawErrors.length}
    />
  );
}
