import { FC, PropsWithChildren } from 'react';
import { useController } from 'react-hook-form';
import { ControlledInputProps } from '../InputProps';
import { GenericSelect, SelectProps } from './Select';

export type ControlledSelectProps = PropsWithChildren<
  ControlledInputProps & SelectProps
>;

export const ControlledSelect: FC<ControlledSelectProps> = ({
  name,
  control,
  hint,
  size,
  label,
  value,
  loading,
  disabled,
  readOnly,
  required,
  description,
  render,
  children,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <GenericSelect
      name={name}
      value={value}
      description={description}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      loading={loading}
      label={label}
      size={size}
      hint={hint}
      onBlur={field.onBlur}
      onChange={field.onChange}
      error={fieldState.error?.message}
      render={render}
      children={children}
    />
  );
};
