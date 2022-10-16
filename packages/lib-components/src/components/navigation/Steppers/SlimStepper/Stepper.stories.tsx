import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../../styled';
import { useStepper } from '../context';
import { Button, SlimStepper, SlimStepperProps } from '../../../../components';
// IMPORTANT: this needs to be imported in the packages that use this component!
import 'rc-tooltip/assets/bootstrap.css';

export default {
  /** useStepper requires a context provider which is (currently) mounted on the root of the application.
   *  <StepperProvider /> requires no parameters.
   */
  title: 'Navigation/SlimStepper',
  component: SlimStepper,
} as Meta<SlimStepperProps>;

const StepBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  p, button {
    margin-bottom: 1rem;
  }
`;

export const Numbers: StoryFn = () => {
  const { incrementCurrentStep, decrementCurrentStep } = useStepper();

  return (
    <SlimStepper showTooltip="always">
      <SlimStepper.Steps>
        <SlimStepper.Step id="first" name="step 1">
          <StepBody>
            <p>Step 1</p>
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="second" name="step 2">
          <StepBody>
            <p>Step 2</p>
            <Button onClick={decrementCurrentStep} text="previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="third" name="step 3">
          <StepBody>
            <p>Step 3</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="fourth" name="step 4">
          <StepBody>
            <p>Step 4</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="fifth" name="step 5">
          <StepBody>
            <p>Step 5</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="sixth" name="step 6">
          <StepBody>
            <p>Step 6</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="seventh" name="step 7">
          <StepBody>
            <p>Step 7</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
            <Button onClick={incrementCurrentStep} text="Next step" />
          </StepBody>
        </SlimStepper.Step>
        <SlimStepper.Step id="eight" name="step 8">
          <StepBody>
            <p>Step 8</p>
            <Button onClick={decrementCurrentStep} text="Previous step" />
          </StepBody>
        </SlimStepper.Step>
      </SlimStepper.Steps>
    </SlimStepper>
  );
};
