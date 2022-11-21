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
          return 'height: .3rem;';
        case 'small':
          return 'height: .4rem;';
        case 'medium':
          return 'height: .5rem;';
        case 'large':
          return 'height: .6rem;';
        case 'huge':
          return 'height: .9rem;';
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
            width: 1.2rem;
            height : 1.2rem;
            margin-top: -${theme.spacing['0_5']};
          `;
        case 'small':
          return `
            width: 1.4rem;
            height : 1.4rem;
            margin-top: -${theme.spacing['0_5']};
          `;
        case 'medium':
          return `
            width: 2rem;
            height: 2rem;
            margin-top: -${theme.spacing['0_75']};
          `;
        case 'large':
          return `
            width: 2.8rem;
            height: 2.8rem;
            margin-top: -${theme.spacing[1]};
          `;
        case 'huge':
          return `
            width: 2.8rem;
            height: 2.8rem;
            margin-left: -${theme.spacing['0_1']};
            margin-top: -${theme.spacing[1]};
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
            width: 0.6rem;
            height : 0.6rem;
            top: -0.1rem;
          `;
        case 'small':
          return `
            width: 0.8rem;
            height : 0.8rem;
            top: -.2rem;
          `;
        case 'medium':
          return `
            width: 1.1rem;
            height: 1.1rem;
            top: -0.3rem;
          `;
        case 'large':
          return `
            width: 1.5rem;
            height: 1.5rem;
            top: -0.4rem;
          `;
        case 'huge':
          return `
            width: 1.8rem;
            height: 1.8rem;
            top: -0.5rem;
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
  size = 'medium',
  // label, // todo: implement label
  marks = [],
}) => {
  const { field: slider } = useController({ name, control, defaultValue });

  const handleChange = (value: number) => {
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
