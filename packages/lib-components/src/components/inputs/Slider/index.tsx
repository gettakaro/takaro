import { FC } from 'react';
import { useController } from 'react-hook-form';
import { handle } from './handle';
import { Skeleton, Label } from '../../../components';
import { Color } from '../../../styled';
import { StyledSlider, Container } from './style';
import { FormProps } from '../FormProps';

interface Mark {
  value: number;
  label: string;
}

export interface SliderProps extends FormProps {
  name: string;
  min: number;
  max: number;
  color?: Color;
  defaultValue?: number;
  readOnly?: boolean;
  showTooltip?: boolean;
  marks?: Mark[];
  step?: number;
  showDots: boolean;
}

export const SliderComponent: FC<SliderProps> = ({
  name,
  color = 'primary',
  control,
  loading, // todo: implement a loading state
  step = 1,
  min,
  max,
  showTooltip = true, // todo fix show Tooltip
  showDots,
  defaultValue = max / 2,
  readOnly = false,
  size = 'medium',
  // label, // todo: implement label
  marks = [],
  label,
  error,
  required,
  hint,
}) => {
  const { field: slider } = useController({ name, control, defaultValue });

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
      <Label
        position="top"
        size={size}
        text={label}
        required={required}
        error={!!error}
        htmlFor={name}
        hint={hint}
      />
      <StyledSlider
        activeDotStyle={{ scale: 1.1 }}
        color={color}
        defaultValue={defaultValue}
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
