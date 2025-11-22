import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';
import { ProgressBar, ProgressBarProps } from '.';
import { styled } from '../../../styled';

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  args: {
    mode: 'indeterminate',
    showPercentage: false,
  },
} as Meta<ProgressBarProps>;

export const Default: StoryFn<ProgressBarProps> = (args) => {
  const [value, setValue] = useState<number>(0);

  return (
    <>
      <ProgressBar {...args} value={value} />

      {args.mode === 'determinate' && (
        <ButtonContainer>
          <button onClick={() => setValue(value - 10)}>-10</button>
          <button onClick={() => setValue(value - 5)}>-5</button>
          <button onClick={() => setValue(value + 5)}>+5</button>
          <button onClick={() => setValue(value + 10)}>+10</button>
        </ButtonContainer>
      )}
    </>
  );
};
