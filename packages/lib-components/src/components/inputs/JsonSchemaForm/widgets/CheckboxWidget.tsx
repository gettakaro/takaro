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
    label = '',
    onChange,
    options,
  } = props;

  // Because an unchecked checkbox will cause html5 validation to fail, only add
  // the "required" attribute if the field value must be "true", due to the
  // "const" or "enum" keywords
  const required = schemaRequiresTrueValue<S>(schema);

  const description = options.description ?? schema.description;

  return (
    <GenericCheckBox
      name={name}
      readOnly={readonly}
      description={description}
      label={label}
      disabled={disabled}
      onChange={onChange}
      required={required}
    />
  );
}
