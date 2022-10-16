import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ProgressBar, ProgressBarProps } from '.';

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  args: {
    mode: 'indeterminate',
    showValue: false,
  }
} as Meta<ProgressBarProps>;

export const Default: StoryFn<ProgressBarProps> = (args) => <ProgressBar {...args} />;

export const Determinate: StoryFn<ProgressBarProps> = () => {
  const [value, setValue] = useState<number>(0);

  return (
    <>
      <ProgressBar mode="determinate" showValue value={value} />
      <button onClick={() => setValue(value + 5)}>+5</button>
      <button onClick={() => setValue(value + 10)}>+10</button>
    </>
  );
};

export const InDeterminate: StoryObj<ProgressBarProps> = {
  args: {
    mode: 'indeterminate'
  }
};
