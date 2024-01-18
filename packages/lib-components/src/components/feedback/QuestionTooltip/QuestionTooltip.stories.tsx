import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { QuestionTooltip } from '.';

export default {
  title: 'Feedback/QuestionTooltip',
  component: QuestionTooltip,
  args: {
    placement: 'bottom',
    label: 'this is the tooltip content',
  },
} as Meta;

export const Default: StoryFn = () => {
  return (
    <div>
      <QuestionTooltip>this is the tooltip content</QuestionTooltip>
    </div>
  );
};
