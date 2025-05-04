import { shade } from 'polished';
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
  margin-bottom: ${({ theme }) => theme.spacing[2]};
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
    border-bottom: 2px solid ${({ theme }) => theme.colors.backgroundAccent};
    width: 100%;
    top: 22px;
    left: calc(50% + 20px);
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
    `
      : '';
  }}

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.fontSize.small};
  }
`;

export const StepperBody = styled.div`
  padding: ${({ theme }) => `${theme.spacing[7]} ${theme.spacing['1_5']}`};
`;

export const StepCounter = styled.div<{
  stepState: StepStates;
  canStepBack: boolean;
}>`
  position: relative;

  /* makes sure the before and after lines don't show above the step circles */
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
  height: 5rem;
  padding: 0.8rem;
  border-radius: 50%;
  border: 0.1rem solid
    ${({ theme, stepState }) => (stepState !== StepStates.OTHER ? theme.colors.primary : theme.colors.backgroundAccent)};
  background-color: ${({ stepState, theme }) =>
    stepState === StepStates.CURRENT ? shade(0.5, theme.colors.primary) : theme.colors.background};
  transition: all 0.2s ease-in-out;
  margin-bottom: ${({ theme }) => theme.spacing[1]};
  color: ${({ theme, stepState }) => (stepState !== StepStates.OTHER ? theme.colors.white : theme.colors.text)};
  font-size: ${({ theme }) => theme.fontSize.small};
  cursor: ${({ stepState, canStepBack }) => (stepState === StepStates.COMPLETE && canStepBack ? 'pointer' : 'inherit')};

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
  }
`;

export const StepName = styled.h4``;
