import { FC } from 'react';
import { Control, useController } from 'react-hook-form';
import Slider from 'rc-slider';
import { handle } from './handle';
import { Color, Size, styled } from '../../../styled';
import { Skeleton } from '../..';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const SliderComp = createSliderWithTooltip(Slider);

const StyledSlider = styled(SliderComp)<{ color: Color; size: Size }>`


  .rc-slider-track {
    background-color: ${({ theme, color }): string => theme.colors[color]};
    ${({ size }) => {
      switch (size) {
        case 'tiny':
          return 'height: 3px;';
        case 'small':
          return 'height: 4px;';
        case 'medium':
          return 'height: 5px;';
        case 'large':
          return 'height: 6px;';
        case 'huge':
          return 'height: 9px;';
      }
    }}
  }

  .rc-slider-handle {
    border: none;
    position: relative;
    background-color: ${({ theme }) => theme.colors.primary};
    &::after {
      content: '';
      position: absolute;
      left: 37.5%;
      top: 50%;
      transform: translateY(-50%);
      height: 25%;
      width: 25%;
      border-radius: 100%;
      background-color: ${({ theme }) => theme.colors.white};
    }

    ${({ size, theme }) => {
      switch (size) {
        case 'tiny':
          return `
            width: 12px;
            height : 12px;
            margin-top: -4px;
          `;
        case 'small':
          return `
            width: 14px;
            height : 14px;
            margin-top: -5px;
          `;
        case 'medium':
          return `
            width: 20px;
            height: 20px;
            margin-top: -8px;
          `;
        case 'large':
          return `
            width: 28px;
            height: 28px;
            margin-top: -12px;
          `;
        case 'huge':
          return `
            width: 28px;
            height: 28px;
            margin-left: 1px;
            margin-top: -10px;
          `;
      }
    }}
  }
  }

  .rc-slider-dot {
    background-color: ${({ theme }): string => theme.colors.gray};
    border-color: ${({ theme }): string => theme.colors.gray};

    ${({ size }) => {
      switch (size) {
        case 'tiny':
          return `
            width: 6px;
            height : 6px;
            top: -1px;
          `;
        case 'small':
          return `
            width: 8px;
            height : 8px;
            top: -2px;
          `;
        case 'medium':
          return `
            width: 11px;
            height: 11px;
            top: -3px;
          `;
        case 'large':
          return `
            width: 15px;
            height: 15px;
            top: -4px;
          `;
        case 'huge':
          return `
            width: 18px;
            height: 18px;
            top: -5px;
          `;
      }
    }}

    &.rc-slider-dot-active {
      border: none;
      background-color: ${({ theme, color }): string => theme.colors[color]};
    }
  }
`;

interface Mark {
  value: number;
  label: string;
}

export interface SliderProps {
  name: string;
  control: Control<any>;
  loading?: boolean;
  min: number;
  max: number;
  color?: Color;
  defaultValue?: number;
  readOnly?: boolean;
  label?: string;
  showTooltip?: boolean;
  marks?: Mark[];
  step?: number;
  showDots: boolean;
  onChange?: (val: number) => void;
  size?: Size;
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
  onChange,
  size = 'medium',
  label, // todo: implement label
  marks = []
}) => {
  const { field: slider } = useController({ name, control, defaultValue });

  const handleChange = (value: number) => {
    if (typeof onChange === 'function') {
      onChange(value);
    }
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
      onChange={(value) => handleChange(value)}
      ref={slider.ref}
      size={size}
      step={step}
      {...(showTooltip && { tipFormatter: undefined })}
      tipProps={{ visible: showTooltip }}
    />
  );
};
