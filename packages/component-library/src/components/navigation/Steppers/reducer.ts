import { ReactNode } from 'react';

export enum stepTypes {
  SET_STEPS = 'SET_STEPS',
  SET_CURRENT_STEP = 'SET_CURRENT_STEP',
  INCREMENT_CURRENT_STEP = 'INCREMENT_CURRENT_STEP',
  DECREMENT_CURRENT_STEP = 'DECREMNT_CURRENT_STEP'
}

export type StepperState = {
  steps: ReactNode[];
  currentStep: number;
};

export const defaultStepperState: StepperState = {
  steps: [],
  currentStep: 0
};

export type ReducerAction =
  | { type: stepTypes.SET_STEPS; payload: { steps: any } }
  | { type: stepTypes.SET_CURRENT_STEP; payload: { amount: number } }
  | { type: stepTypes.INCREMENT_CURRENT_STEP; payload: null }
  | { type: stepTypes.DECREMENT_CURRENT_STEP; payload: null };

export const reducer = (state: StepperState, action: ReducerAction) => {
  switch (action.type) {
    case stepTypes.SET_CURRENT_STEP:
      return {
        ...state,
        currentStep: action.payload.amount
      };
    case stepTypes.SET_STEPS:
      return {
        ...state,
        steps: action.payload?.steps
      };
    case stepTypes.INCREMENT_CURRENT_STEP:
      return {
        ...state,
        currentStep:
          state.currentStep < state.steps.length - 1 ? state.currentStep + 1 : state.currentStep
      };
    case stepTypes.DECREMENT_CURRENT_STEP:
      return {
        ...state,
        currentStep: state.currentStep > 0 ? state.currentStep - 1 : state.currentStep
      };
    default:
      return state;
  }
};
