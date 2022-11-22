import { Color, Size, styled } from '../../../styled';
import Slider from 'rc-slider';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const SliderComp = createSliderWithTooltip(Slider);

export const Container = styled.div`
  width: 100%;
`;

export const StyledSlider = styled(SliderComp)<{ color: Color; size: Size }>`

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
    background-color: ${({ theme, color }) => theme.colors[color]};
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

  .rc-slider-tooltip-inner {
    background-color: ${({ theme, color }) => theme.colors[color]}!important;
    font-weight: 600;
  }

  .rc-slider-tooltip-arrow {
    border-top-color: ${({ theme, color }) => theme.colors[color]}!important;
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
