import { FC, useEffect, Children, isValidElement, ReactElement, PropsWithChildren } from 'react';
import { useStepper } from '../useStepper';
import { Container, StepperBody, StepperHeader, StepperHeaderItem, StepCounter, StepName } from './style';
import { AiOutlineCheck as CheckMark } from 'react-icons/ai';
import { Spinner } from '../../..';
import { StepStates } from '../stepStates';
/* Dot behavior components */
// wrapper <StepperSteps/> component around the multiple <step/>

const StepperSteps: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { currentStep, steps, setSteps } = useStepper();

  useEffect(() => {
    const stepperSteps = Children.toArray(children)
      .filter((step) => isValidElement(step) && typeof step.type !== 'string' && step.type.name === 'StepperStep')
      .map((step) => {
        if (isValidElement(step)) {
          return step.props;
        }
        return null;
      });
    setSteps(stepperSteps);
  }, [setSteps, currentStep]);

  return (
    <div>
      {children &&
        Children.map(
          children,
          (child) => steps.length !== 0 && isValidElement(child) && child.props.id === steps[currentStep].id && child,
        )}
    </div>
  );
};

// Single <step/> subcomponent
interface StepProps {
  name: string;
  id: string;
  icon?: ReactElement;
}
export type FCStep = FC<PropsWithChildren<StepProps>>;

const StepperStep: FCStep = ({ children }) => {
  return <>{children}</>;
};

export interface StepperProps {
  currentStepIsLoading?: boolean;
  canStepBack?: boolean; // disable step back via step header
}

// Main <Stepper/> component which contains subcomponents
export const Stepper: FC<PropsWithChildren<StepperProps>> & {
  Step: FC<PropsWithChildren<StepProps>>;
  Steps: FC<PropsWithChildren<unknown>>;
} = ({ currentStepIsLoading = false, canStepBack = true, children }) => {
  const { currentStep, steps, setCurrentStep } = useStepper();

  function getStepState(index: number, currentStep: number) {
    if (index === currentStep) {
      return StepStates.CURRENT;
    }
    if (currentStep > index) {
      return StepStates.COMPLETE;
    }
    return StepStates.OTHER;
  }

  function handleClick(index: number, currentStep: number) {
    if (getStepState(index, currentStep) === StepStates.COMPLETE && canStepBack) {
      setCurrentStep(index);
    }
  }

  return (
    <Container>
      <StepperHeader>
        {steps.length &&
          steps.map((step: StepProps, index: number) => (
            <StepperHeaderItem key={step.id} stepState={getStepState(index, currentStep)}>
              <StepCounter
                canStepBack={canStepBack}
                onClick={() => handleClick(index, currentStep)}
                stepState={getStepState(index, currentStep)}
              >
                {currentStep > index ? (
                  <CheckMark size={24} />
                ) : currentStep === index ? (
                  currentStepIsLoading ? (
                    <Spinner size="small" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )
                ) : step.icon ? (
                  step.icon
                ) : (
                  index + 1
                )}
              </StepCounter>
              <StepName>{step.name}</StepName>
            </StepperHeaderItem>
          ))}
      </StepperHeader>
      <StepperBody>{children}</StepperBody>
    </Container>
  );
};

// Set dot components
Stepper.Step = StepperStep;
Stepper.Steps = StepperSteps;
