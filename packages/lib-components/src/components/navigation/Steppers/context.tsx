import { FC, createContext, useContext, useReducer, useCallback, PropsWithChildren, ReactNode } from 'react';
import { reducer, StepperState, stepTypes } from './reducer';

const StepperContext = createContext<any>(undefined);

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

export const useStepper = () => {
  const [state, dispatch] = useContext(StepperContext);
  const { currentStep, steps } = state;

  if (!StepperContext) {
    throw new Error('useStepper should be used inside StepperProvider');
  }

  // callback hooks otherwise we remake these fns on every change.
  const incrementCurrentStep = useCallback(() => dispatch({ type: stepTypes.INCREMENT_CURRENT_STEP }), [dispatch]);
  const decrementCurrentStep = useCallback(() => dispatch({ type: stepTypes.DECREMENT_CURRENT_STEP }), [dispatch]);
  const setSteps = useCallback(
    (steps: ReactNode[]) => dispatch({ type: stepTypes.SET_STEPS, payload: { steps } }),
    [dispatch],
  );
  const setCurrentStep = useCallback(
    (amount: number) => dispatch({ type: stepTypes.SET_CURRENT_STEP, payload: { amount } }),
    [dispatch],
  );

  return {
    incrementCurrentStep,
    decrementCurrentStep,
    setSteps,
    setCurrentStep,
    currentStep,
    steps,
  };
};
