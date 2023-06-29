import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { Popover, PopoverProps } from '.';

export default {
  title: 'Feedback/Popover',
  component: Popover,
  args: {
    placement: 'bottom',
  },
} as Meta<PopoverProps>;

export const UnControlled: StoryFn<PopoverProps> = () => (
  <Popover>
    <Popover.Trigger>hover this to open it the popover</Popover.Trigger>
    <Popover.Content>this is the content of the popover</Popover.Content>
  </Popover>
);
