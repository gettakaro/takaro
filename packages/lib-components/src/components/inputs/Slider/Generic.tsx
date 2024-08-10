import { forwardRef } from 'react';
import { handle } from './handle';
import { Color } from '../../../styled';
import { StyledSlider } from './style';
import { defaultInputProps, defaultInputPropsFactory, GenericInputPropsFunctionHandlers } from '../InputProps';

interface Mark {
  value: number;
  label: string;
}

export interface SliderProps {
  min: number;
  max: number;
  color?: Color;
  showTooltip?: boolean;
  marks?: Mark[];
  step?: number;
  showDots: boolean;
}

export type GenericSliderProps = SliderProps & GenericInputPropsFunctionHandlers<number, HTMLDivElement>;

const defaultsApplier = defaultInputPropsFactory<GenericSliderProps>(defaultInputProps);

// TODO: should probably switch to the radixUI version
export const GenericSlider = forwardRef<HTMLDivElement, GenericSliderProps>(function GenericSlider(props, ref) {
  const {
    color = 'primary',
    size,
    min,
    max,
    step = 1,
    value = max / 2,
    marks = [],
    readOnly,
    showTooltip = true,
    showDots,
    onChange,
    id,
  } = defaultsApplier(props);

  const handleOnChange = (value: number) => {
    onChange(value);
  };

  // todo: memo this
  const transformedMarks: { [key: number]: string } = {};
  for (const { value, label } of marks) {
    transformedMarks[value] = label;
  }

  return (
    <StyledSlider
      id={id}
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
      ref={ref}
      size={size}
      step={step}
      {...(showTooltip && { tipFormatter: undefined })}
      tipProps={{ visible: showTooltip }}
    />
  );
});
