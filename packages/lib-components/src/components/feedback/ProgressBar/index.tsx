import { FC } from 'react';
import { shade } from 'polished';
import { styled, Color as C, Size } from '../../../styled';
import { keyframes } from 'styled-components';
import { AlertVariants } from '../Alert';

type Color = C | AlertVariants;

const indeterminateAnimation = keyframes`
  0% {
    transform:  translateX(0) scaleX(0);
  }
  40% {
    transform:  translateX(0) scaleX(0.4);
  }
  100% {
    transform:  translateX(100%) scaleX(0.5);
  }
`;

const IndeterminateProgress = styled.div<{ color: Color }>`
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  height: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  will-change: translateX, scaleX;

  &::after {
    position: absolute;
    content: '';
    width: 100%;
    top: 1px;
    height: calc(100% - 4px);
    background-color: ${({ theme, color }) => shade(0.5, theme.colors[color])};
    border: 1px solid ${({ theme, color }) => theme.colors[color]};
    animation: ${indeterminateAnimation} 5s infinite linear;
    transform-origin: 0% 50%;
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
`;
const Progress = styled.div<{ color: Color; progress: number; size: Size }>`
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  height: ${({ theme, size }) => {
    switch (size) {
      case 'tiny':
        return theme.spacing['0_5'];
      case 'small':
        return theme.spacing['0_75'];
      case 'medium':
        return theme.spacing['1_5'];
      case 'large':
        return theme.spacing['2_5'];
      case 'huge':
        return theme.spacing['4'];
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};

  &::after {
    position: absolute;
    content: '';
    width: ${({ progress }) => progress}%;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    height: ${({ theme, size }) => {
      switch (size) {
        case 'tiny':
          return theme.spacing['0_5'];
        case 'small':
          return theme.spacing['0_75'];
        case 'medium':
          return theme.spacing['1_5'];
        case 'large':
          return theme.spacing['2_5'];
        case 'huge':
          return theme.spacing['4'];
      }
    }};
    max-width: 100%;
    transition: 0.2s width ease-out;
    background-color: ${({ theme, color }) => theme.colors[color]};
  }
`;

const Label = styled.div`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export interface ProgressBarProps {
  mode: 'determinate' | 'indeterminate';
  value?: number;
  color?: Color;
  showPercentage?: boolean;
  size?: Size;
  /// To make the progressbar a bit more visually pleasing, you can set a minimum fill value.
  /// If the actual value is below this value, the progressbar will still show the minimum fill value.
  minFill?: number;
}

export const ProgressBar: FC<ProgressBarProps> = ({
  mode,
  value = 0,
  color = 'primary',
  showPercentage = false,
  size = 'medium',
  minFill = 0,
}) => {
  if (mode === 'determinate') {
    return (
      <Container>
        <Progress color={color} progress={value > minFill ? value : minFill} size={size} />
        {showPercentage && <Label>{Math.min(value, 100)}%</Label>}
      </Container>
    );
  }

  return (
    <Container>
      <IndeterminateProgress color={color} />
    </Container>
  );
};
