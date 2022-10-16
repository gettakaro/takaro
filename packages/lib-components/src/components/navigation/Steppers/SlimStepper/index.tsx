import { FC, useEffect, Children, isValidElement } from 'react';
import Tooltip from 'rc-tooltip';
import { useStepper } from '../context';
import { Container, StepperBody, StepperHeader, StepperHeaderItem, Dot } from './style';
import { StepStates } from '../stepStates';
/* Dot behavior components */
// wrapper <StepperSteps/> component around the multiple <step/>
const StepperSteps: FC<{ children: FC<StepProps>[] }> = ({ children }) => {
  const { currentStep, steps, setSteps } = useStepper();

  useEffect(() => {
    const stepperSteps = Children.toArray(children)
      .filter(
        (step) =>
          isValidElement(step) && typeof step.type !== 'string' && step.type.name === 'StepperStep'
      )
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
          (child) =>
            steps.length !== 0 &&
            isValidElement(child) &&
            child.props.id === steps[currentStep].id &&
            child
        )}
    </div>
  );
};

// Single <step/> subcomponent
interface StepProps {
  name: string;
  id: string;
}
const StepperStep: FC<StepProps> = ({ children }) => {
  return <>{children}</>;
};

export interface SlimStepperProps {
  canStepBack?: boolean; // disable step back via step header
  showTooltip?: 'never' | 'always' | 'hover';
}

// Main <Stepper/> component which contains subcomponents
export const SlimStepper: FC<SlimStepperProps> & {
  Step: FC<StepProps>;
  Steps: any;
} = ({ showTooltip = 'hover', canStepBack = true, children }) => {
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
          steps.map(({ id, name }: StepProps, index: number) => (
            <StepperHeaderItem
              canStepBack={canStepBack}
              key={id}
              onClick={() => handleClick(index, currentStep)}
              stepState={getStepState(index, currentStep)}
            >
              {StepStates.CURRENT === getStepState(index, currentStep) &&
                showTooltip !== 'never' ? (
                <Tooltip
                  overlay={name}
                  placement="bottom"
                  {...(showTooltip === 'always' && { visible: true })}
                >
                  <Dot stepState={getStepState(index, currentStep)} />
                </Tooltip>
              ) : (
                <Dot stepState={getStepState(index, currentStep)} />
              )}
            </StepperHeaderItem>
          ))}
      </StepperHeader>
      <StepperBody>{children}</StepperBody>
    </Container>
  );
};

// Set dot components
SlimStepper.Step = StepperStep;
SlimStepper.Steps = StepperSteps;
