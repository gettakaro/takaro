import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { ProgressBar, ProgressBarProps } from '.';
import { styled } from '../../../styled';

const ButtonContainer = styled.div`
  display: flex;
  button {
    &:first-child {
      margin: 0 1rem;
    }
  }
`;

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  args: {
    mode: 'indeterminate',
    showValue: false,
  },
} as Meta<ProgressBarProps>;

export const Default: StoryFn<ProgressBarProps> = (args) => <ProgressBar {...args} />;

export const Determinate: StoryFn<ProgressBarProps> = () => {
  const [value, setValue] = useState<number>(0);

  return (
    <>
      <ProgressBar mode="determinate" showPercentage value={value} />
      <ButtonContainer>
        <button onClick={() => setValue(value + 5)}>+5</button>
        <button onClick={() => setValue(value + 10)}>+10</button>
      </ButtonContainer>
    </>
  );
};
