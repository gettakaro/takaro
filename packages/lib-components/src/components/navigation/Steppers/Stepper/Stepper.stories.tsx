import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { useStepper } from '../useStepper';
import { Button, Stepper } from '../../../../components';
import { AiFillSafetyCertificate as Safety, AiFillBell as Bell } from 'react-icons/ai';
import { MdLocalShipping as Shipping } from 'react-icons/md';

export default {
  /** useStepper requires a context provider which is (currenlty) mounted on the root of the application.
   *  <StepperProvider /> requires no parameters.
   */
  title: 'Navigation/Stepper',
  component: Stepper,
} as Meta;

const StepBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  p,
  button {
    margin-bottom: 1rem;
  }
`;

export const Numbers: StoryFn = () => {
  const { incrementCurrentStep, decrementCurrentStep } = useStepper();

  return (
    <Stepper>
      <Stepper.Steps>
        <Stepper.Step id="first" name="step 1">
          <StepBody>
            <p>Step 1</p>
            <Button onClick={incrementCurrentStep}>Next step</Button>
          </StepBody>
        </Stepper.Step>
        <Stepper.Step id="second" name="step 2">
          <StepBody>
            <p>Step 2</p>
            <Button onClick={decrementCurrentStep}>previous step</Button>
            <Button onClick={incrementCurrentStep}>Next step</Button>
          </StepBody>
        </Stepper.Step>
        <Stepper.Step id="third" name="step 3">
          <StepBody>
            <p>Step 3</p>
            <Button onClick={decrementCurrentStep}>Previous step</Button>
          </StepBody>
        </Stepper.Step>
      </Stepper.Steps>
    </Stepper>
  );
};

export const Icons: StoryFn = () => {
  const { incrementCurrentStep, decrementCurrentStep } = useStepper();

  return (
    <Stepper>
      <Stepper.Steps>
        <Stepper.Step icon={<Bell size="24" />} id="first" name="Shopping">
          <StepBody>
            <p>Step 1</p>
            <Button onClick={incrementCurrentStep}>Next step</Button>
          </StepBody>
        </Stepper.Step>
        <Stepper.Step icon={<Shipping size="24" />} id="second" name="Shipping">
          <StepBody>
            <p>Step 2</p>
            <Button onClick={decrementCurrentStep}>previous step</Button>
            <Button onClick={incrementCurrentStep}>Next step</Button>
          </StepBody>
        </Stepper.Step>
        <Stepper.Step icon={<Safety size="24" />} id="third" name="Payment">
          <StepBody>
            <p>Step 3</p>
            <Button onClick={decrementCurrentStep}>Previous step</Button>
          </StepBody>
        </Stepper.Step>
      </Stepper.Steps>
    </Stepper>
  );
};
