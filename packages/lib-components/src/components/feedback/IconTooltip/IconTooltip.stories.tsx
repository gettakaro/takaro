import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { IconTooltip, IconTooltipProps } from '.';
import { AiOutlineQuestion as QuestionIcon } from 'react-icons/ai';

export default {
  title: 'Feedback/IconTooltip',
  component: IconTooltip,
  args: {
    placement: 'bottom',
  },
} as Meta<IconTooltipProps>;

export const Default: StoryFn<IconTooltipProps> = (args) => {
  return (
    <div style={{ width: '200px' }}>
      <IconTooltip placement={args.placement} initialOpen={args.initialOpen} icon={<QuestionIcon />}>
        this is the tooltip content
      </IconTooltip>
    </div>
  );
};
