import { FieldProps } from '@rjsf/utils';
import { GenericTextField } from '../../TextField';

export const StringField = ({
  onChange,
  onBlur,
  disabled,
  placeholder,
  rawErrors,
  required,
  readonly,
  name,
}: FieldProps) => {
  return (
    <GenericTextField
      name={name}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      loading={false}
      error={rawErrors ? rawErrors[0] : undefined}
      required={required}
      readOnly={readonly}
      type="text"
    />
  );
};
