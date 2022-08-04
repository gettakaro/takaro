import { keyframes } from 'styled-components';

export const pulseAnimation = (color: string) => keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${color}B3;
  }
  30% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0,0,0,0.0);
  }
  45% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0,0,0,0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0,0,0,0);
  }
`;

export const shakeAnimation = keyframes`
  2.5%, 22.5% {
    transform: translate3d(-1px, 0, 0);
  }
  5%, 20% {
    transform: translate3d(2px, 0, 0);
  }

  7.5%, 12.5%, 17.5% {
    transform: translate3d(-4px, 0, 0);
  }
  10%, 15% {
    transform: translate3d(4px, 0, 0);
  }
`;
