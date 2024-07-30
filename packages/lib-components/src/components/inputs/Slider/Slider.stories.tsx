import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { useForm, useWatch } from 'react-hook-form';
import { SliderProps, Slider } from '../../../components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50vh;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

export default {
  title: 'Inputs/Slider',
  component: Slider,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
  args: {
    readOnly: false,
    description: 'Slider description',
    min: 0,
    max: 100,
    hint: 'This is the hint',
    name: 'Slider',
    step: 1,
    showTooltip: true,
    label: 'Slider label',
    disabled: false,
    loading: false,
    required: false,
  },
} as Meta<SliderProps>;

const Template: StoryFn<SliderProps> = (args) => {
  const { control } = useForm();
  return <Slider {...args} control={control} />;
};

// Default Checkbox
export const Default = Template.bind({});
Default.args = {
  name: 'default-slider',
  min: 0,
  max: 100,
  step: 1,
  loading: false,
  label: 'slider label',
  color: 'primary',
};

export const Steps = Template.bind({});
Steps.args = {
  name: 'slider-with-steps',
  min: 0,
  max: 100,
  step: 10,
  showDots: false,
  loading: false,
  color: 'primary',
};

export const StepsWithDots = Template.bind({});
StepsWithDots.args = {
  name: 'slider-with-dots',
  min: 0,
  max: 100,
  step: 10,
  showDots: true,
  loading: false,
  color: 'primary',
};

export const OnChange: StoryFn<SliderProps> = (args) => {
  const { control } = useForm({ mode: 'onChange' });
  const sliderValue = useWatch({ control, name: 'Slider' });

  return (
    <>
      <Slider
        control={control}
        description="slider description"
        readOnly={args.readOnly}
        label={args.label}
        loading={args.loading}
        showTooltip={args.showTooltip}
        showDots={args.showDots}
        max={args.max}
        min={args.min}
        name={args.name}
        step={args.step}
        required={args.required}
        disabled={args.disabled}
      />
      <pre>value: {sliderValue}</pre>
    </>
  );
};
