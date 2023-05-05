import { FieldProps } from '@rjsf/utils';
import { GenericTextField } from '../../TextField';

export const StringField = ({
  onChange,
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
      disabled={disabled}
      placeholder={placeholder}
      loading={false}
      errorMessage={rawErrors ? rawErrors[0] : undefined}
      required={required}
      readOnly={readonly}
      type="text"
    />
  );
};
