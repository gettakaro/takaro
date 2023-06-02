import { FC } from 'react';
import { ControlledInputProps } from '../../InputProps';
import { useController } from 'react-hook-form';
import { GenericRadio, RadioProps } from '.';

export const ControlledRadio: FC<RadioProps & ControlledInputProps> = ({
  label,
  readOnly,
  required,
  description,
  disabled,
  loading,
  size,
  hint,
  control,
  name,
  selected,
  setSelected,
  labelPosition,
  defaultSelected,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
  });

  return (
    <GenericRadio
      defaultSelected={defaultSelected}
      labelPosition={labelPosition}
      setSelected={setSelected}
      selected={selected}
      value={field.value}
      name={name}
      hint={hint}
      size={size}
      loading={loading}
      disabled={disabled}
      description={description}
      required={required}
      readOnly={readOnly}
      error={fieldState.error?.message}
      onChange={field.onChange}
      onBlur={field.onBlur}
      label={label}
    />
  );
};
