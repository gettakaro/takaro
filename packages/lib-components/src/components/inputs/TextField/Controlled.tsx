import { FC } from 'react';
import { useController } from 'react-hook-form';
import { GenericTextField, TextFieldProps } from '.';
import { ControlledInputProps } from '../InputProps';

export const ControlledTextField: FC<ControlledInputProps & TextFieldProps> = ({
  name,
  control,
  required,
  loading,
  disabled,
  type,
  icon,
  size,
  description,
  readOnly,
  placeholder,
  label,
  hint,
  prefix,
  suffix,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <GenericTextField
      error={fieldState.error?.message}
      onChange={field.onChange}
      onBlur={field.onBlur}
      disabled={disabled}
      required={required}
      loading={loading}
      type={type}
      icon={icon}
      size={size}
      name={name}
      label={label}
      hint={hint}
      prefix={prefix}
      suffix={suffix}
      readOnly={readOnly}
      placeholder={placeholder}
      description={description}
      value={field.value}
    />
  );
};
