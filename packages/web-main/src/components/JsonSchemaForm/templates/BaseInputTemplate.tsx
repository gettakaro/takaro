import { ChangeEvent, FocusEvent } from 'react';
import { BaseInputTemplateProps, getInputProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { UnControlledTextField } from '@takaro/lib-components';

/** The `BaseInputTemplate` is the template to use to render the basic `<input>` component for the `core` theme.
 * It is used as the template for rendering many of the <input> based widgets that differ by `type` and callbacks only.
 * It can be customized/overridden for other themes or individual implementations as needed.
 *
 * @param props - The `WidgetProps` for this template
 */
export function BaseInputTemplate<T = any, S extends StrictRJSFSchema = RJSFSchema, F extends FormContextType = any>(
  props: BaseInputTemplateProps<T, S, F>,
) {
  const {
    id,
    placeholder,
    required,
    readonly,
    disabled,
    type,
    value,
    onChange,
    onChangeOverride,
    onBlur,
    onFocus,
    options,
    schema,
  } = props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);

  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onBlur(id, value);
  const _onFocus = ({ target: { value } }: FocusEvent<HTMLInputElement>) => onFocus(id, value);

  return (
    <UnControlledTextField
      id={id}
      name={id}
      required={required}
      disabled={disabled}
      type={inputProps.type as any}
      readOnly={readonly}
      value={value as string}
      placeholder={placeholder}
      onChange={onChangeOverride || _onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      hasDescription={!!schema.description}
      hasError={!!props.rawErrors?.length}
    />
  );
}
