import { FC, PropsWithChildren } from 'react';
import { useController } from 'react-hook-form';
import { handle } from './handle';
import { Skeleton, Label } from '../../../components';
import { Color } from '../../../styled';
import { StyledSlider, Container } from './style';
import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

interface Mark {
  value: number;
  label: string;
}

export interface SliderProps extends InputProps {
  min: number;
  max: number;
  color?: Color;
  showTooltip?: boolean;
  marks?: Mark[];
  step?: number;
  showDots: boolean;
}

const defaultsApplier =
  defaultInputPropsFactory<PropsWithChildren<SliderProps>>(defaultInputProps);

export const SliderComponent: FC<SliderProps> = (props) => {
  const {
    name,
    color = 'primary',
    size,
    control,
    min,
    max,
    step = 1,
    value = max / 2,
    required,
    marks = [],
    error,
    disabled,
    loading,
    label,
    hint,
    readOnly,
    showTooltip = true,
    showDots,
  } = defaultsApplier(props);

  const { field: slider } = useController({
    name,
    control,
    defaultValue: value,
  });

  const handleOnChange = (value: number) => {
    slider.onChange(value);
  };

  // todo: memo this
  const transformedMarks: { [key: number]: string } = {};
  for (const { value, label } of marks) {
    transformedMarks[value] = label;
  }

  if (loading) {
    return <Skeleton height="6px" variant="text" width="100%" />;
  }

  return (
    <Container>
      {label && (
        <Label
          position="top"
          size={size}
          text={label}
          required={required}
          error={!!error}
          htmlFor={name}
          hint={hint}
          disabled={disabled}
        />
      )}
      <StyledSlider
        activeDotStyle={{ scale: 1.1 }}
        color={color}
        defaultValue={value as number}
        disabled={readOnly}
        dots={showDots}
        handle={handle}
        marks={transformedMarks}
        max={max}
        min={min}
        onChange={handleOnChange}
        ref={slider.ref}
        size={size}
        step={step}
        {...(showTooltip && { tipFormatter: undefined })}
        tipProps={{ visible: showTooltip }}
      />
    </Container>
  );
};
