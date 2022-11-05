import { Meta, StoryFn } from '@storybook/react';
import { styled } from '../../../styled';
import { SliderComponent, SliderProps } from '.';
import { useForm } from 'react-hook-form';
import 'rc-slider/assets/index.css';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50vh;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem;
`;

export default {
  title: 'Inputs/Slider',
  component: SliderComponent,
  decorators: [(story) => <Wrapper>{story()}</Wrapper>]
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
  onChange: (val: number) => {
    console.log(val);
  }
};

export const Steps = Template.bind({});
Steps.args = {
  name: 'slider-with-steps',
  min: 0,
  max: 100,
  step: 10
};

export const StepsWithDots = Template.bind({});
StepsWithDots.args = {
  name: 'slider-with-dots',
  min: 0,
  max: 100,
  step: 10,
  showDots: true
};
