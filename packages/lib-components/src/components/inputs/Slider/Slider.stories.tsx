import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { useForm } from 'react-hook-form';
import { SliderComponent, SliderProps } from '.';
import 'rc-slider/assets/index.css';

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
  component: SliderComponent,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>],
} as Meta<SliderProps>;

const Template: StoryFn<SliderProps> = (args) => {
  const { control } = useForm();
  return <SliderComponent {...args} control={control} />;
};

// Default Checkbox
export const Default = Template.bind({});
Default.args = {
  name: 'default-slider',
  min: 0,
  max: 100,
  step: 1,
  showDots: false,
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
