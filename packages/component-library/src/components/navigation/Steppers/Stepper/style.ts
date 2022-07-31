import { styled } from '../../../../styled';
import { StepStates } from '../stepStates';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const StepperHeader = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;
export const StepperHeaderItem = styled.div<{ stepState: StepStates }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;

  &::after {
    position: absolute;
    content: '';
    border-bottom: 2px solid ${({ theme }) => theme.colors.background};
    width: 100%;
    top: 22px;
    left: calc(50% + 20px);
    z-index: 1;
  }

  &:first-child {
    &::before {
      content: none;
    }
  }

  &:last-child {
    &::after {
      content: none;
    }
  }

  ${({ stepState, theme }): string => {
    return stepState !== StepStates.OTHER
      ? `
    &::before {
      position: absolute;
      content: '';
      border-bottom: 2px solid ${theme.colors.primary};
      width: 100%;
      top: 22px;
      left: -50%;
      z-index: 3;
    `
      : '';
  }}

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const StepperBody = styled.div`
  padding: 50px 16px;
`;

export const StepCounter = styled.div<{
  stepState: StepStates;
  canStepBack: boolean;
}>`
  position: relative;
  z-index: 5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  padding: 0.8rem;
  border-radius: 50%;
  border: 2px solid
    ${({ theme, stepState }) =>
      stepState !== StepStates.OTHER ? theme.colors.primary : theme.colors.background};
  background-color: ${({ stepState, theme }) =>
    stepState === StepStates.CURRENT ? theme.colors.primary : theme.colors.white};
  transition: all 0.2s ease-in-out;
  margin-bottom: 1rem;
  color: ${({ theme, stepState }) =>
    stepState !== StepStates.OTHER ? theme.colors.white : theme.colors.text};
  font-size: 1.5rem;
  font-weight: 500;
  cursor: ${({ stepState, canStepBack }) =>
    stepState === StepStates.COMPLETE && canStepBack ? 'pointer' : 'inherit'};

  svg {
    fill: ${({ theme, stepState }) => {
      switch (stepState) {
        case StepStates.COMPLETE:
          return theme.colors.primary;
        case StepStates.CURRENT:
          return theme.colors.white;
        case StepStates.OTHER:
          return '#ccc';
      }
    }};
    z-index: 5;
  }
`;

export const StepName = styled.h4``;
