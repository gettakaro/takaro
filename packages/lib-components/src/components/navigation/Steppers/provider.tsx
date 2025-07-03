import { FC, PropsWithChildren, useReducer } from 'react';
import { StepperState, reducer } from './reducer';
import { StepperContext } from './context';

interface StepperProviderProps {
  startStep?: number;
}

export const StepperProvider: FC<PropsWithChildren<StepperProviderProps>> = ({ startStep = 0, children }) => {
  const defaultStepperState: StepperState = {
    steps: [],
    currentStep: startStep,
  };

  const [state, dispatch] = useReducer(reducer, defaultStepperState);

  return <StepperContext.Provider value={[state, dispatch]}>{children}</StepperContext.Provider>;
};
