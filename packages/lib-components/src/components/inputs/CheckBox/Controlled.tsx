import { FC } from 'react';
import { useController } from 'react-hook-form';
import { CheckBoxProps, GenericCheckBox } from '.';
import { ControlledInputProps } from '../InputProps';

export interface ControlledCheckBoxProps
  extends CheckBoxProps,
    ControlledInputProps {
  onChange?: (val: boolean) => unknown;
}

export const ControlledCheckBox: FC<ControlledCheckBoxProps> = ({
  hint,
  description,
  disabled,
  loading,
  size,
  value,
  control,
  name,
  required,
  label,
  readOnly,
  onChange = () => {},
  labelPosition,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: value,
  });

  return (
    <GenericCheckBox
      labelPosition={labelPosition}
      readOnly={readOnly}
      label={label}
      required={required}
      name={name}
      value={value}
      size={size}
      loading={loading}
      disabled={disabled}
      description={description}
      hint={hint}
      error={fieldState.error?.message}
      onChange={(val: boolean) => {
        onChange(val);
        field.onChange(val);
      }}
    />
  );
};
