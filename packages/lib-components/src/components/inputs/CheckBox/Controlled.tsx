import { FC } from 'react';
import { useController } from 'react-hook-form';
import { CheckBoxProps, GenericCheckBox } from '.';
import { ControlledInputProps } from '../InputProps';

export interface ControlledCheckBoxProps
  extends CheckBoxProps,
    ControlledInputProps {}

export const ControlledCheckBox: FC<ControlledCheckBoxProps> = ({
  hint,
  description,
  disabled,
  loading,
  size,
  control,
  name,
  required,
  label,
  readOnly,
  labelPosition,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <GenericCheckBox
      labelPosition={labelPosition}
      readOnly={readOnly}
      label={label}
      required={required}
      name={name}
      size={size}
      loading={loading}
      disabled={disabled}
      description={description}
      hint={hint}
      error={fieldState.error?.message}
      onChange={field.onChange}
      onBlur={field.onBlur}
      value={field.value}
    />
  );
};
