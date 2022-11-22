import { FC } from 'react';
import { styled, Color } from '../../../styled';
import { darken } from 'polished';
import { keyframes } from 'styled-components';

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
  border-radius: 1rem;
  overflow: hidden;
  will-change: translateX, scaleX;

  &::after {
    position: absolute;
    content: '';
    width: 100%;
    height: 100%;
    background-color: ${({ theme, color }) => theme.colors[color]};
    animation: ${indeterminateAnimation} 5s infinite linear;
    transform-origin: 0% 50%;
    border-radius: 1rem;
    background-color: ${({ theme, color }) => theme.colors[color]};
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: ${({ theme }) => theme.spacing[1]};
`;
const Progress = styled.div<{ color: Color; progress: number }>`
  width: calc(100% - 50px);
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
  height: ${({ theme }) => theme.spacing[1]};
  border-radius: 1rem;
  overflow: hidden;

  &::after {
    position: absolute;
    content: '';
    width: ${({ progress }) => progress}%;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
    height: ${({ theme }) => theme.spacing[1]};
    max-width: 100%;
    transition: 0.2s width ease-out;
    background-color: ${({ theme, color }) => darken(0.2, theme.colors[color])};
    background-image: ${({ theme, color }): string =>
      `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${theme.colors[
        color
      ].slice(
        1,
        theme.colors[color].length
      )}' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`};
  }
`;

const Label = styled.div`
  margin-left: ${({ theme }) => theme.spacing[1]};
`;

export interface ProgressBarProps {
  mode: 'determinate' | 'indeterminate';
  value?: number;
  color?: Color;
  showValue?: boolean;
}

export const ProgressBar: FC<ProgressBarProps> = ({
  mode,
  value = 0,
  color = 'primary',
  showValue = false,
}) => {
  if (mode === 'determinate') {
    return (
      <Container>
        <Progress color={color} progress={value} />
        {showValue && <Label>{Math.min(value, 100)}%</Label>}
      </Container>
    );
  }

  return (
    <Container>
      <IndeterminateProgress color={color} />
    </Container>
  );
};
