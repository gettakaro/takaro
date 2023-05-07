import { SliderProps } from 'rc-slider';
import { FC } from 'react';
import { useController } from 'react-hook-form';
import { GenericSlider } from '.';
import { ControlledInputProps } from '../InputProps';

export type ControlledSliderProps = ControlledInputProps & SliderProps;

// TODO: fix step and marks
export const ControlledSlider: FC<ControlledSliderProps> = ({
  name,
  size,
  min = 0,
  max = 10,
  value = max / 2,
  required,
  disabled,
  loading,
  label,
  hint,
  control,
  description,
  readOnly,
  dots = false,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: value,
  });

  return (
    <GenericSlider
      value={value}
      marks={[]}
      step={1}
      showDots={dots}
      readOnly={readOnly}
      label={label}
      required={required}
      name={name}
      size={size}
      loading={loading}
      disabled={disabled}
      hint={hint}
      description={description}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
      min={min}
      max={max}
    />
  );
};
