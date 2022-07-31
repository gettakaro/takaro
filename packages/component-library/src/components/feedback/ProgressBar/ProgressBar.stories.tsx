import { Meta, Story } from '@storybook/react';
import { useState } from 'react';
import { ProgressBar, ProgressBarProps } from '.';

export default {
  title: 'Feedback/ProgressBar',
  component: ProgressBar
} as Meta;

export const Determinate: Story<ProgressBarProps> = (args) => {
  const [value, setValue] = useState<number>(0);

  return (
    <>
      <ProgressBar mode="determinate" showValue value={value} />
      <button onClick={() => setValue(value + 5)}>+5</button>
      <button onClick={() => setValue(value + 10)}>+10</button>
    </>
  );
};

export const InDeterminate: Story<ProgressBarProps> = (args) => (
  <ProgressBar mode="indeterminate" />
);
