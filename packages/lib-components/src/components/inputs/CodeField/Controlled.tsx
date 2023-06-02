import { FC } from 'react';
import { useController } from 'react-hook-form';
import { CodeFieldProps, GenericCodeField } from '.';
import { ControlledInputProps } from '../InputProps';

export type ControlledCodeFieldProps = ControlledInputProps & CodeFieldProps;

export const ControlledCodeField: FC<ControlledCodeFieldProps> = ({
  description,
  hint,
  disabled,
  loading,
  size,
  name,
  required,
  label,
  readOnly,
  fields,
  allowedCharacters,
  autoSubmit,
  control,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <GenericCodeField
      readOnly={readOnly}
      label={label}
      required={required}
      name={name}
      value={field.value}
      size={size}
      loading={loading}
      disabled={disabled}
      hint={hint}
      description={description}
      onBlur={field.onBlur}
      onChange={field.onChange}
      error={fieldState.error?.message}
      autoSubmit={autoSubmit}
      allowedCharacters={allowedCharacters}
      fields={fields}
    />
  );
};
