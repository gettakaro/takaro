import { forwardRef } from 'react';
import { handle } from './handle';
import { Color } from '../../../styled';
import { StyledSlider } from './style';
import {
  defaultInputProps,
  GenericInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

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

export type GenericSliderProps = SliderProps &
  GenericInputProps<HTMLDivElement>;

const defaultsApplier =
  defaultInputPropsFactory<GenericSliderProps>(defaultInputProps);

// TODO: should probably switch to the radixUI version
// TODO: not sure how to type this ref correctly
export const GenericSlider = forwardRef<any, GenericSliderProps>(
  (props, ref) => {
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
  }
);
