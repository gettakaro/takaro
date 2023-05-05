import { FC } from 'react';
import { GenericTextAreaField, TextAreaFieldProps } from '.';
import { ControlledInputProps } from '../InputProps';
import { useController } from 'react-hook-form';

type ControlledTextAreaFieldProps = TextAreaFieldProps & ControlledInputProps;

export const ControlledTextAreaField: FC<ControlledTextAreaFieldProps> = ({
  placeholder,
  name,
  hint,
  label,
  readOnly,
  description,
  size,
  value,
  required,
  disabled,
  control,
  loading,
}) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: value ?? '',
    rules: {
      required: required,
    },
  });

  return (
    <GenericTextAreaField
      name={field.name}
      placeholder={placeholder}
      onChange={field.onChange}
      onBlur={field.onBlur}
      loading={loading}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      description={description}
      value={value}
      size={size}
      label={label}
      hint={hint}
      error={error?.message}
    />
  );
};
