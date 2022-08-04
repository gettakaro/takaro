import { styled } from '../../../../styled';
import { StepStates } from '../stepStates';
import { lighten } from 'polished';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
`;

export const StepperHeader = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background-color: pink;
  width: 35vw;
  height: 0.7rem;
  border-radius: 1rem;
  margin: auto auto;
`;
export const StepperHeaderItem = styled.div<{
  stepState: StepStates;
  canStepBack: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: orange;
  flex: 1;
  ${({ theme, stepState }) => {
    if (stepState === StepStates.COMPLETE) {
      return `border-right: .6rem solid ${lighten(0.15, theme.colors.primary)}`;
    } else {
      return 'border-right: .6rem solid transparent';
    }
  }};

  cursor: ${({ stepState, canStepBack }) =>
    stepState === StepStates.COMPLETE && canStepBack ? 'pointer' : 'inherit'};

  &:first-child {
    border-top-left-radius: 1rem;
    border-bottom-left-radius: 1rem;
  }
  &:last-child {
    border-top-right-radius: 1rem;
    border-bottom-right-radius: 1rem;
    border-right: none;
  }

  background-color: ${({ stepState, theme }) =>
    stepState === StepStates.COMPLETE || stepState === StepStates.CURRENT
      ? theme.colors.primary
      : lighten(0.32, theme.colors.primary)};

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

export const Dot = styled.div<{ stepState: StepStates }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  border-radius: 100%;
  ${({ stepState, theme }) => {
    switch (stepState) {
      case StepStates.CURRENT:
        return `
        right: calc(-1.6rem / 2);
        width: 1.6rem;
        height: 1.6rem;
        background-color: ${theme.colors.primary};
      `;
      case StepStates.OTHER:
        return `
        right: calc(-.7rem/2);
        width: .7rem;
        height: .7rem;
        background-color: ${lighten(0.2, theme.colors.primary)};
      `;
    }
  }}
`;

export const StepperBody = styled.div`
  padding: 7rem 1.6rem;
`;
