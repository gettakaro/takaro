import { useCallback, useContext } from 'react';
import { StepperContext } from './context';
import { stepTypes } from './reducer';
import { ReactNode } from '@tanstack/react-router';

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
